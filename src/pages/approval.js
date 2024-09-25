import React, { useEffect, useState } from 'react';
import { Card, Typography, Row, Col, Table, Button, message, Modal, Tag, Input, Avatar } from 'antd';
import axios from 'axios';
import moment from 'moment'; // Import moment for date handling
import { UserOutlined, MailOutlined, ApartmentOutlined, ClockCircleOutlined, FieldTimeOutlined } from '@ant-design/icons'; // Import Ant Design icons
import jwt from 'jsonwebtoken';
import { useNavigate } from 'react-router-dom';


const { Title, Text } = Typography;

const Approval = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [timesheets, setTimesheets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false); // Modal visibility state
    const [approverComments, setApproverComments] = useState('');
    const [departments, setDepartments] = useState([]);
    const [departmentName, setDepartmentName] = useState([]);
    const [userHours, setUserHours] = useState({});
    const navigate = useNavigate();

    // Check if token exists
    const token = localStorage.getItem('token');
    const decoded = jwt.decode(token);
    const userId = decoded?.sub;

    // Redirect if no token or token is invalid
    useEffect(() => {
        if (!token || !decoded) {
            message.info('You do not have permission. Please log in.');
            navigate('/login'); // Redirect to login page
        }
    }, [token, decoded, navigate]);

    // Fetch the list of users for the manager to approve
    useEffect(() => {
        if (!token) {
            return; // Exit the function if no token
        }

        const fetchUsers = async () => {
            let config = {
                method: 'get',
                maxBodyLength: Infinity,
                url: `${process.env.REACT_APP_DNIO_SERVICES_BASE_URL}/${process.env.REACT_APP_DNIO_APP_NAME}/${process.env.REACT_APP_DNIO_SERVICE_USERS}/?filter={"managerId._id": "${userId}"}&expand=false`,
                headers: {
                    'accept': '*/*',
                    'Authorization': process.env.REACT_APP_DNIO_API_KEY
                }
            };

            axios.request(config)
                .then((response) => {
                    setUsers(response.data);
                    message.success('Employees fetched successfully');
                })
                .catch((error) => {
                    console.log(error);
                    message.error('Failed to fetch Employees');
                });
        };
        fetchUsers();
    }, []);

    // Fetch the list of departments for the manager to approve
    useEffect(() => {
        const fetchDepartments = async () => {
            let config = {
                method: 'get',
                maxBodyLength: Infinity,
                url: `${process.env.REACT_APP_DNIO_SERVICES_BASE_URL}/${process.env.REACT_APP_DNIO_APP_NAME}/${process.env.REACT_APP_DNIO_SERVICE_DEPARTMENTS}/?expand=false`,
                headers: {
                    'accept': '*/*',
                    'Authorization': process.env.REACT_APP_DNIO_API_KEY
                }
            };

            axios.request(config)
                .then((response) => {
                    setDepartments(response.data);
                })
                .catch((error) => {
                    console.log(error);
                    message.error('Failed to fetch Departments');
                });
        };
        fetchDepartments();
    }, []);

    // Fetch a map
    useEffect(() => {
        let mapDepartmentIdName = {};
        departments.forEach((department) => {
            mapDepartmentIdName[department._id] = department.departmentName;
        })
        setDepartmentName(mapDepartmentIdName);
    }, [departments]);

    const fetchTimesheets = async (userId) => {
        setLoading(true);
        try {
            let config = {
                method: 'get',
                maxBodyLength: Infinity,
                url: `${process.env.REACT_APP_DNIO_SERVICES_BASE_URL}/${process.env.REACT_APP_DNIO_APP_NAME}/${process.env.REACT_APP_DNIO_SERVICE_TIMESHEETS}/?filter={"userId._id": "${userId}"}&sort=-date.rawData`,
                headers: {
                    'accept': '*/*',
                    'Authorization': process.env.REACT_APP_DNIO_API_KEY
                }
            };

            const response = await axios.request(config);
            setTimesheets((prevUsersTimesheet) => ({
                ...prevUsersTimesheet,
                [userId]: response.data
            }));
            return response.data;
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    //Fetch Approval for a perticular Timesheet ID
    const fetchApprovals = async (timesheetId) => {
        setLoading(true);
        try {
            let config = {
                method: 'get',
                maxBodyLength: Infinity,
                url: `${process.env.REACT_APP_DNIO_SERVICES_BASE_URL}/${process.env.REACT_APP_DNIO_APP_NAME}/${process.env.REACT_APP_DNIO_SERVICE_APPROVALS}/?filter={"timesheetId._id": "${timesheetId}"}`,
                headers: {
                    'accept': '*/*',
                    'Authorization': process.env.REACT_APP_DNIO_API_KEY
                }
            };
            const response = await axios.request(config);
            return response.data;
        } catch (error) {
            console.log('Error in fetchApprovals: ', error);
            message.error('Approvals Fetching Failed!');
        } finally {
            setLoading(false);
        }
    };

    // Calculate total hours worked for the current month and week
    const calculateUserHours = (timesheets, userId) => {
        const currentMonth = moment().month();
        const currentWeekStart = moment().startOf('week');
        const currentWeekEnd = moment().endOf('week');

        let monthlyTotal = 0;
        let weeklyTotal = 0;

        timesheets.forEach(timesheet => {
            const timesheetDate = moment(timesheet.date.tzData);

            // Check if the timesheet is in the current month
            if (timesheetDate.month() === currentMonth) {
                monthlyTotal += timesheet.hoursWorked;
            }

            // Check if the timesheet is in the current week
            if (timesheetDate.isBetween(currentWeekStart, currentWeekEnd, null, '[]')) {
                weeklyTotal += timesheet.hoursWorked;
            }
        });

        setUserHours((prevUserHours) => ({
            ...prevUserHours,
            [userId]: {
                monthlyTotal,
                weeklyTotal
            }
        }));
    };

    useEffect(() => {
        users.forEach(async (user) => {
            fetchTimesheets(user._id)
                .then((timesheetDataForPerticularUser) => {
                    calculateUserHours(timesheetDataForPerticularUser, user._id);
                });
        });
    }, [users]);

    // Handle selecting a user (clicking the card)
    const handleUserSelect = (user) => {
        setSelectedUser(user);
        // fetchTimesheets(user._id);
        setIsModalVisible(true); // Show the modal when a user is selected
    };

    // Close modal
    const handleCloseModal = () => {
        setIsModalVisible(false);
    };

    // Approve or Reject timesheet
    const handleTimesheetAction = async (timesheetId, action) => {
        try {
            let approvalData = await fetchApprovals(timesheetId);
            let data;
            if (approvalData.length === 0) {
                data = JSON.stringify([
                    {
                        "dataService": {
                            "app": `${process.env.REACT_APP_DNIO_APP_NAME}`,
                            "name": "Timesheets"
                        },
                        "operation": "PUT",
                        "filter": {
                            "_id": `${timesheetId}`
                        },
                        "data": {
                            "status": `${action}`
                        }
                    },
                    {
                        "dataService": {
                            "app": `${process.env.REACT_APP_DNIO_APP_NAME}`,
                            "name": "Approvals"
                        },
                        "operation": "POST",
                        "data": {
                            "timesheetId": {
                                "_id": `${timesheetId}`
                            },
                            "approverId": {
                                "_id": "USE20240914131536541973"
                            },
                            "status": `${action}`,
                            "approvalDate": {
                                "rawData": `${moment()}`
                            },
                            "comments": `${approverComments}`
                        }
                    }
                ]);
            } else {
                data = JSON.stringify([
                    {
                        "dataService": {
                            "app": `${process.env.REACT_APP_DNIO_APP_NAME}`,
                            "name": "Timesheets"
                        },
                        "operation": "PUT",
                        "filter": {
                            "_id": `${timesheetId}`
                        },
                        "data": {
                            "status": `${action}`
                        }
                    },
                    {
                        "dataService": {
                            "app": `${process.env.REACT_APP_DNIO_APP_NAME}`,
                            "name": "Approvals"
                        },
                        "operation": "PUT",
                        "filter": {
                            "_id": `${approvalData[0]._id}`
                        },
                        "data": {
                            "approverId": {
                                "_id": "USE20240914131536541973"
                            },
                            "status": `${action}`,
                            "approvalDate": {
                                "rawData": `${moment()}`
                            },
                            "comments": `${approverComments}`
                        }
                    }
                ]);
            }

            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: `${process.env.REACT_APP_COMMON_TXN_API}`,
                headers: {
                    'accept': '*/*',
                    'Content-Type': 'application/json',
                    'Authorization': `${process.env.REACT_APP_DNIO_API_KEY}`
                },
                data: data
            };

            setLoading(true);
            axios.request(config)
                .then((response) => {
                    console.log(JSON.stringify(response.data));
                    message.success(`Timesheet ${action === 'Approved' ? 'Approved' : 'Rejected'} successfully!`);
                    fetchTimesheets(selectedUser._id);
                })
                .catch((error) => {
                    console.log(error);
                    message.error('Action failed');
                })
                .finally(() => {
                    setLoading(false);
                });
        } catch (error) {
            console.log('Error in handleTimesheetAction: ', error)
            message.error('Error in handleTimesheetAction');
        } finally {
            setLoading(false);
        }
    };

    // Render status tag with colors based on status
    const renderStatusTag = (status) => {
        switch (status) {
            case 'Approved':
                return <Tag color="green">Approved</Tag>;
            case 'Rejected':
                return <Tag color="red">Rejected</Tag>;
            default:
                return <Tag color="blue">Submitted</Tag>;
        }
    };

    return (
        <div>
            <Title level={2} style={{ textAlign: 'center', marginBottom: '40px' }}>Approve Timesheets</Title>

            <Row gutter={[24, 24]}>
                {users.map(user => (
                    <Col xs={24} sm={12} md={8} key={user._id}>
                        <Card
                            bordered={false}
                            hoverable
                            onClick={() => handleUserSelect(user)}
                            style={{
                                backgroundColor: '#F0FAFC', // Light background color
                                borderRadius: '10px',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                textAlign: 'center',
                            }}
                            styles={{ padding: '20px' }}
                        >
                            <Avatar
                                size={64}
                                icon={<UserOutlined />}
                                src={`https://www.gravatar.com/avatar/${user.email}?d=identicon`}
                                style={{ marginBottom: '15px' }}
                            />
                            <Title level={4} style={{ marginBottom: '10px' }}>{user.name}</Title>
                            <Text type="secondary" style={{ display: 'block', marginBottom: '5px' }}>
                                <MailOutlined /> {user.email}
                            </Text>
                            <Text type="secondary" style={{ display: 'block', marginBottom: '10px' }}>
                                <ApartmentOutlined /> {departmentName[`${user.departmentId._id}`]}
                            </Text>
                            <Text type="secondary" style={{ display: 'block', marginBottom: '10px' }}>
                                <ClockCircleOutlined /> Monthly Hours: {userHours[user._id]?.monthlyTotal || 0}
                            </Text>
                            <Text type="secondary" style={{ display: 'block', marginBottom: '10px' }}>
                                <FieldTimeOutlined /> Weekly Hours: {userHours[user._id]?.weeklyTotal || 0}
                            </Text>
                        </Card>

                    </Col>
                ))}
            </Row>

            {/* Timesheet Modal */}
            <Modal
                title={`Timesheets for ${selectedUser ? selectedUser.name : ''}`}
                open={isModalVisible}
                onCancel={handleCloseModal}
                footer={null}
                width={1100}
            >
                <Table
                    dataSource={timesheets[selectedUser?._id] || []}  // Access timesheets by user ID, or provide an empty array if none
                    columns={[
                        {
                            title: 'Date',
                            dataIndex: 'date',
                            key: 'date',
                            render: (_, record) => moment(record.date.tzData).format('dddd, MMM D'),
                        },
                        {
                            title: 'Hours Worked',
                            dataIndex: 'hoursWorked',
                            key: 'hoursWorked',
                        },
                        {
                            title: 'Notes',
                            dataIndex: 'notes',
                            key: 'notes',
                            width: 250,
                            render: text => {
                                const wrappedText = text.match(/.{1,20}/g)?.join('\n');
                                return wrappedText || text;
                            },
                        },
                        {
                            title: 'Status',
                            dataIndex: 'status',
                            key: 'status',
                            render: (status) => renderStatusTag(status),
                        },
                        {
                            title: 'Approver Comment',
                            dataIndex: 'approverComment',
                            key: 'approverComment',
                            width: 250,
                            render: (text) => (
                                <Input
                                    defaultValue={text}
                                    onChange={(e) => setApproverComments(e.target.value)}
                                    placeholder="Enter notes here"
                                />
                            ),
                        },
                        {
                            title: 'Action',
                            key: 'action',
                            render: (_, record) => (
                                <>
                                    <Button
                                        type="primary"
                                        style={{ marginRight: 8 }}
                                        onClick={() => handleTimesheetAction(record._id, 'Approved')}
                                        disabled={record.status === 'Approved'}
                                    >
                                        Approve
                                    </Button>
                                    <Button
                                        type="danger"
                                        onClick={() => handleTimesheetAction(record._id, 'Rejected')}
                                        disabled={record.status === 'Rejected'}
                                        style={{
                                            opacity: record.status === 'Rejected' ? 0.5 : 1,  // Greying effect when disabled
                                            cursor: record.status === 'Rejected' ? 'not-allowed' : 'pointer',  // Change cursor when disabled
                                        }}
                                    >
                                        Reject
                                    </Button>
                                </>
                            ),
                        },
                    ]}
                    rowKey="_id"
                    loading={loading}
                />

            </Modal>
        </div>
    );
};

export default Approval;
