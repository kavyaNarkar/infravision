import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchAllIssues, assignTeamToIssue, fetchActionStatuses, assignIssueAction, resolveIssueAction, updateActionStatus } from '../services/issuesService';
import { IssuesContext } from './IssuesContextCore';

// Re-export context for backward compatibility with hooks/useIssues.js
export { IssuesContext };

export const IssuesProvider = ({ children }) => {
    const [allIssues, setAllIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadIssues = useCallback(async (isSilent = false) => {
        try {
            if (!isSilent) setLoading(true);
            setError(null);
            const token = sessionStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const fetched = await fetchAllIssues({ headers }); 
            const unified = fetched.map(issue => ({
                ...issue,
                status: (issue.status === 'fixed' || issue.status === 'resolved' || issue.status === 'completed') ? 'resolved' : 'active',
                subStatus: issue.status || 'detected'
            }));
            setAllIssues(unified);
        } catch (err) {
            console.error('Error loading issues:', err);
            if (!isSilent) setError(err.message || 'Failed to load issues');
        } finally {
            if (!isSilent) setLoading(false);
        }
    }, []);

    const [actionStatus, setActionStatus] = useState({ assigned: [], resolved: [] });

    const loadActionData = useCallback(async () => {
        try {
            const data = await fetchActionStatuses();
            setActionStatus({
                assigned: data.assigned_issues || [],
                resolved: data.resolved_issues || []
            });
        } catch (err) {
            console.error('Error loading action data:', err);
        }
    }, []);

    useEffect(() => {
        loadIssues();
        loadActionData();
        const interval = setInterval(async () => {
            await Promise.all([loadIssues(true), loadActionData()]);
        }, 15000);
        return () => clearInterval(interval);
    }, [loadIssues, loadActionData]);

    const enrichedIssues = useMemo(() => {
        const result = allIssues.map(issue => {
            const rawId = issue.id?.toString().trim().toLowerCase();
            const assigned = actionStatus.assigned.find(a => {
                const aId = (a.issueId || a.id)?.toString().trim().toLowerCase();
                return aId === rawId;
            });
            const resolved = actionStatus.resolved.find(r => {
                const rId = (r.issueId || r.id)?.toString().trim().toLowerCase();
                return rId === rawId;
            });

            let status = issue.status;
            let subStatus = issue.subStatus;

            if (resolved) {
                status = 'resolved';
                subStatus = 'completed';
            } else if (assigned) {
                status = 'active';
                subStatus = assigned.status || 'assigned';
            }

            return {
                ...issue,
                status,
                subStatus,
                assignedTo: assigned?.assignedTo || null,
                resolvedBy: resolved?.resolvedBy || null,
                resolvedAt: resolved?.resolvedAt || null,
                actionData: assigned || resolved || null,
                isAssigned: !!assigned,
                isResolved: !!resolved
            };
        });

        // Diagnostic Mapping Debug
        console.group('Issues Mapping Debug');
        console.table(result.slice(0, 5).map(i => ({ 
            id: i.id?.toString().substring(0, 8), 
            stat: i.status, 
            sub: i.subStatus 
        })));
        console.groupEnd();
        
        return result;
    }, [allIssues, actionStatus]);

    const assignIssue = useCallback(async (issueId, team, notes) => {
        const idStr = issueId?.toString().trim();
        
        setActionStatus(prev => ({
            ...prev,
            assigned: [...prev.assigned, { issueId: idStr, status: 'assigned', assignedTo: team }]
        }));

        try {
            const issue = enrichedIssues.find(i => i.id?.toString().trim() === idStr);
            if (!issue) return;

            const collectionMap = {
                'Roads': 'potholes',
                'Bridges': 'bridge',
                'Water': 'waterleakage',
                'Street Lights': 'streetlights'
            };
            const sourceCollection = collectionMap[issue.module] || 'issues';

            await assignIssueAction(idStr, team, sourceCollection);
            await Promise.all([loadActionData(), loadIssues(true)]);
        } catch (err) {
            console.error('Failed to assign issue:', err);
            await loadActionData();
            throw err;
        }
    }, [enrichedIssues, loadIssues, loadActionData]);

    const resolveIssue = useCallback(async (issueId, resolver) => {
        const idStr = issueId?.toString().trim();

        setActionStatus(prev => ({
            assigned: prev.assigned.filter(a => (a.issueId || a.id)?.toString().trim() !== idStr),
            resolved: [...prev.resolved, { issueId: idStr, resolvedBy: resolver, resolvedAt: new Date() }]
        }));

        try {
            await resolveIssueAction(idStr, resolver);
            await Promise.all([loadActionData(), loadIssues(true)]);
        } catch (err) {
            console.error('Failed to resolve issue:', err);
            await loadActionData();
            throw err;
        }
    }, [loadIssues, loadActionData]);

    const startProgress = useCallback(async (issueId) => {
        if (!issueId) return;
        const idStr = issueId.toString().trim();
        
        console.log(`[Lifecycle] Start Progress: ${idStr}`);
        
        setActionStatus(prev => ({
            ...prev,
            assigned: prev.assigned.map(a => {
                const aId = (a.issueId || a.id)?.toString().trim();
                return aId === idStr ? { ...a, status: 'in-progress' } : a;
            })
        }));

        try {
            const response = await updateActionStatus(idStr, 'in-progress');
            console.log('[Lifecycle] Server response:', response);
            
            if (!response.success) {
                throw new Error(response.message || 'Server update failed');
            }

            await loadActionData();
        } catch (err) {
            console.error('[Lifecycle] Deploy FAILED:', err);
            await loadActionData();
            alert(`Deploy failed: ${err.message}`);
        }
    }, [loadActionData]);


    const reopenIssue = useCallback((issueId) => {
        setAllIssues(prev => prev.map(i =>
            i.id === issueId ? {
                ...i,
                status: 'active',
                subStatus: 'detected',
                resolvedAt: null
            } : i
        ));
    }, []);

    const value = useMemo(() => ({
        allIssues: enrichedIssues,
        loading,
        error,
        refreshIssues: loadIssues,
        assignIssue,
        resolveIssue,
        startProgress,
        reopenIssue,
        assignedCount: actionStatus.assigned.length,
        resolvedCount: actionStatus.resolved.length
    }), [enrichedIssues, loading, error, loadIssues, assignIssue, resolveIssue, startProgress, reopenIssue, actionStatus]);

    return (
        <IssuesContext.Provider value={value}>
            {children}
        </IssuesContext.Provider>
    );
};

export default IssuesProvider;
