import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { Button, Card, CheckList, ErrorMessage, FlexCenter, Input, List, NoTask, SearchInput, Skeleton, TaskBottom, TaskTop, Title, WithTask } from "../style/style";
import { Controller, useForm } from 'react-hook-form';
import Highlighter from 'react-highlight-words';
import _ from 'lodash';
import axios from 'axios';


import Header from "../components/Header";
import Modal from '../components/Modal';
import PieChart from '../components/Pie';

const apiURL = process.env.REACT_APP_API_URL;

const Dashboard = () => {
    const navigate = useNavigate();
    const [taskLoading, setTaskLoading] = useState(true);
    const [latestLoading, setLatestLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [show, setShow] = useState(false);
    const [user, setUser] = useState(null);
    const [task, setTask] = useState({
        tasksCompleted: 0,
        totalTasks: 0,
        latestTasks: [],
        listing: []
    });

    const { control, handleSubmit, formState: { errors }, reset, getValues } = useForm({
        defaultValues: {
            id: 0,
            name: "",
            completed: false
        }
    });

    const axiosRef = useRef(null);

    const openModal = (value) => {
        document.body.style.overflowY = 'hidden';

        setShow(true);
        reset({
            id: value ? value._id : 0,
            name: value ? value.name : "",
            completed: value ? value.completed : false
        });
    }

    const closeModal = () => {
        document.body.style.overflowY = 'auto';
        setShow(false);
    }

    const remove = id => {
        const taskListing = task.listing.filter(t => t._id !== id);
        axiosRef.current.delete(`${apiURL}/tasks/${id}`).then(() => {
            setTask({
                totalTasks: taskListing.length,
                tasksCompleted: taskListing.filter(t => t.completed === true).length,
                latestTasks: _.orderBy(taskListing, ["createdAt"], ["desc"]).filter((t, k) => t._id !== id && k < 3),
                listing: taskListing
            });
        }).catch(error => {
            toast.error(error);
        })
    }

    const store = async value => {
        let resp = null;
        try {
            if (value.id !== 0) {//update
                let data = { name: value.name, completed: value.completed };
                resp = await axiosRef.current.put(`${apiURL}/tasks/${value.id}`, data);

                let tasksCompleted = task.tasksCompleted;
                if (task.listing.find(t => t._id === value.id).completed !== value.completed) {
                    if (value.completed) tasksCompleted += 1;
                    else tasksCompleted -= 1;
                }

                setTask({
                    ...task,
                    tasksCompleted: tasksCompleted,
                    latestTasks: task.latestTasks.map(t => t._id === value.id ? resp.data.task : t),
                    listing: task.listing.map(t => t._id === value.id ? resp.data.task : t)
                });
                toast.success(resp.data.msg)
            } else {//create
                resp = await axiosRef.current.post(`${apiURL}/tasks`, {
                    name: value.name
                });

                const taskListing = [resp.data.task, ...task.listing];
                setTask({
                    ...task,
                    totalTasks: task.totalTasks + 1,
                    latestTasks: _.orderBy(taskListing, ["createdAt"], ["desc"]).filter((t, k) => k < 3),
                    listing: taskListing
                });
                toast.success(resp.data.msg)
            }
            closeModal();
        } catch (error) {
            toast.error(error);
        }
    }

    const handleFilter = useMemo(() => {
        return task.listing.filter(t => t.name.toLowerCase().includes(String(search).toLowerCase()));
    }, [task.listing, search]);

    useEffect(() => {
        if (localStorage.getItem("userData")) {
            const fromSession = JSON.parse(localStorage.getItem("userData"));

            axiosRef.current = axios.create({
                headers: { Authorization: `Bearer ${fromSession.token.token}` }
            });

            setUser(fromSession);
        } else {
            navigate('/login')
        }
    }, [navigate])

    useEffect(() => {
        setTaskLoading(true);
        setTimeout(() => {
            setTaskLoading(false);
        }, 1000)
    }, [search])

    useEffect(() => {
        if (user) {
            setLatestLoading(true);
            axios.all([
                axiosRef.current.get(`${apiURL}/dashboard`),
                axiosRef.current.get(`${apiURL}/tasks`),
            ]).then(resp => {
                setTimeout(() => {
                    setLatestLoading(false);
                }, 1000);

                setTask({
                    ...resp[0].data,
                    listing: resp[1].data.tasks
                });
            }).catch(error => {
                toast.error(error)
            })
        }
    }, [user])

    return (<>
        <Header navigate={navigate} user={user} />
        {task.totalTasks === 0 ?
            <NoTask>
                <Card
                    gap="20px"
                    style={{
                        padding: "37px 64px"
                    }}
                >
                    <Title>You have no task.</Title>
                    <Button onClick={() => openModal(null)}>+ New Task</Button>
                </Card>
            </NoTask> :
            <WithTask>
                <TaskTop>
                    <Card>
                        <Title>Tasks Completed</Title>
                        <div className="count">
                            <span>{task.tasksCompleted}</span>
                            <span> / {task.totalTasks}</span>
                        </div>
                    </Card>
                    <Card>
                        <Title>Latest Created Tasks</Title>
                        <List>
                            {
                                latestLoading ? <div>
                                    <Skeleton height="14px" width="100%" />
                                    <Skeleton height="14px" width="90%" />
                                    <Skeleton height="14px" width="80%" />
                                </div> :
                                    task.latestTasks.map((value, key) => (
                                        <li className={`${value.completed && "strike"}`} key={key}>{value.name}</li>
                                    ))
                            }
                        </List>
                    </Card>
                    <Card>
                        <PieChart incompleted={task.totalTasks - task.tasksCompleted} completed={task.tasksCompleted} />
                    </Card>
                </TaskTop>
                <TaskBottom>
                    <div className="title">
                        <Title>Tasks</Title>
                        <div className="action">
                            <SearchInput>
                                <Input placeholder="Search by task name" onChange={e => setSearch(e.target.value)} />
                                <img src="./icons/search-solid.svg" alt="search" />
                            </SearchInput>
                            <Button onClick={() => openModal(null)}>+ New Task</Button>
                        </div>
                    </div>
                    <Card>
                        {taskLoading ? <div style={{ padding: "24px" }}>
                            <Skeleton height="24px" width="100%" />
                            <Skeleton height="24px" width="90%" />
                            <Skeleton height="24px" width="80%" />
                        </div> : (
                            handleFilter.length > 0 ?
                                _.orderBy(handleFilter, ["createdAt"], ["desc"]).map((value, key) => (
                                    <CheckList key={key} style={{
                                        borderBottom: key === handleFilter.length - 1 ? "unset" : "2px solid #E8E8E8"
                                    }}>
                                        <div className="list">
                                            <input type='checkbox' checked={value.completed} onChange={() => store({ id: value._id, name: value.name, completed: !value.completed })} />
                                            <Title className={`${value.completed && "strike"}`} onClick={() => store({ id: value._id, name: value.name, completed: !value.completed })}>
                                                <Highlighter
                                                    searchWords={[search]}
                                                    autoEscape={true}
                                                    textToHighlight={value.name}
                                                />
                                            </Title>
                                        </div>
                                        <div className="action">
                                            <img onClick={() => openModal(value)} src="./icons/pen-solid.svg" style={{ marginRight: "16px" }} alt="pen" />
                                            <img onClick={() => remove(value._id)} src="./icons/trash-solid.svg" alt="trash" />
                                        </div>
                                    </CheckList>
                                )) :
                                <FlexCenter className="h-100">
                                    <Title>No task found</Title>
                                </FlexCenter>
                        )
                        }
                    </Card>
                </TaskBottom>
            </WithTask>

        }
        <Modal show={show} onClose={closeModal}>
            <Title style={{ paddingBottom: "12px" }}>{getValues("id") === 0 ? "+ New" : <><img src="./icons/pen-solid.svg" alt="pen" /> Edit</>} Task</Title>
            <form id="taskForm" onSubmit={handleSubmit(store)}>
                <Controller
                    control={control}
                    name="name"
                    render={({ field }) => <Input {...field} placeholder="Task Name" type="text" />}
                    rules={{ required: true }}
                />
            </form>
            {errors.name && <ErrorMessage>Name is required</ErrorMessage>}
            <Button className="full" type="submit" form="taskForm">{getValues("id") === 0 ? "+ New" : "Update"} Task</Button>
        </Modal>
    </>)
}

export default Dashboard;