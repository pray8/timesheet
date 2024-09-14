import React from 'react';


const ApprovalPage = () => {
    const [timesheets, setTimesheets] = useState([]);

    useEffect(() => {
        axios.get('/api/timesheets?status=Submitted')
            .then(response => setTimesheets(response.data))
            .catch(error => console.error('Error fetching timesheets', error));
    }, []);

    const handleApprove = (id) => {
        axios.post(`/api/timesheets/${id}/approve`)
            .then(() => alert('Timesheet approved'))
            .catch(error => console.error('Approval error', error));
    };

    const handleReject = (id) => {
        axios.post(`/api/timesheets/${id}/reject`)
            .then(() => alert('Timesheet rejected'))
            .catch(error => console.error('Rejection error', error));
    };

    return (
        <div>
            <h2>Approve Timesheets</h2>
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Hours Worked</th>
                        <th>Project</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {timesheets.map(timesheet => (
                        <tr key={timesheet.id}>
                            <td>{timesheet.date}</td>
                            <td>{timesheet.hours_worked}</td>
                            <td>{timesheet.project_name}</td>
                            <td>
                                <button onClick={() => handleApprove(timesheet.id)}>Approve</button>
                                <button onClick={() => handleReject(timesheet.id)}>Reject</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
