import React, {useEffect, useState} from 'react';
import './App.css';
import Box from './Box'
import Dropdown from "./Dropdown";
interface Task {
    id: string;
    title: string;
    completed: boolean;
}

function generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0,
            v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
const App: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);

    const [showTasks, setShowTasks] = useState<Task[]>([]);
    const [progress, setProgress] = useState<number>(0);
    const [selectedOption, setSelectedOption] = useState<string>("All");
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [selectedTaskId, setSelectedTaskId] = useState<string>("");
    const [editingTaskId, setEditingTaskId] = useState<string>("");
    const [editingTitle, setEditingTitle] = useState<string>("");

    const addTaskHandler = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (newTaskTitle === '') return;
        const newTask = {id: generateUUID().toString(), title: newTaskTitle, completed: false};

        const response = await fetch('http://localhost:3001/todos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newTask),
        });


        if (!response.ok) {
            console.error("Error posting to API: ", response.status);
            return;
        }


        setTasks([...tasks, newTask]);
        setNewTaskTitle('');
    };

    const changeStatusHandler = async (taskId: string) => {
        const updatedTasks = tasks.map(task => {
            if (task.id === taskId) {
                return {...task, completed: !task.completed};
            }
            return task;
        });

        const updatedTask = updatedTasks.find(task => task.id === taskId);
        if (!updatedTask) {
            console.error('Task not found');
            return;
        }

        const response = await fetch(`http://localhost:3001/todos/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedTask),
        });

        if (!response.ok) {
            console.error("Error updating the API: ", response.status);
            return;
        }

        setTasks(updatedTasks);
    };

    const handleToggleOptions = (taskId: string) => {
        if (selectedTaskId === taskId) {
            setSelectedTaskId("");
        } else {
            setSelectedTaskId(taskId);
        }
    };

    const handleOptionSelection = async (option: string) => {
        if (option === 'Edit') {
            const selectedTask = tasks.find(task => task.id === selectedTaskId);
            if (selectedTask) {
                setEditingTitle(selectedTask.title);
            }
            setEditingTaskId(selectedTaskId);
        } else if (option === 'Delete') {
            const response = await fetch(`http://localhost:3001/todos/${selectedTaskId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                console.error("Error deleting from the API: ", response.status);
                return;
            }

            const filteredTasks = tasks.filter(task => task.id !== selectedTaskId);
            setTasks(filteredTasks);
        }

        setSelectedTaskId("");
    };

    const saveTaskHandler = async (event: React.FormEvent) => {
        event.preventDefault();
        const updatedTasks = tasks.map(task => task.id === editingTaskId ? {...task, title: editingTitle} : task);

        const updatedTask = updatedTasks.find(task => task.id === editingTaskId);
        if (!updatedTask) {
            console.error('Task not found');
            return;
        }

        const response = await fetch(`http://localhost:3001/todos/${editingTaskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedTask),
        });

        if (!response.ok) {
            console.error("Error updating the API: ", response.status);
            return;
        }

        setTasks(updatedTasks);
        setEditingTaskId("");
        setEditingTitle("");
    };

    useEffect(() => {
        const completedTasks = tasks.filter(task => task.completed).length;
        setProgress(completedTasks)
        if (selectedOption === 'Done') {
            setShowTasks(tasks.filter(task => task.completed))
        } else if (selectedOption === 'Undone') {
            setShowTasks(tasks.filter(task => !task.completed))
        } else {
            setShowTasks(tasks)
        }
    }, [selectedOption, tasks])

    useEffect(() => {
        fetch('http://localhost:3001/todos')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => setTasks(data))
            .catch(error => console.log('Error while fetching tasks:', error));
    }, []);

    return (
        <div className="app">
            <Box className="progress-box">
                <h2>Progress</h2>
                <div className="progress-bar-max" style={{width: '450px'}}>
                    <div className="progress-bar"
                         style={{width: progress * 450 / tasks.length}}></div>
                </div>
                <p style={{color: '#e8e7e3'}}>{tasks.filter(task => task.completed).length} completed</p>
            </Box>
            <ul className="task-list"
                style={{width: '100px', alignItems: 'center', justifyContent: 'center', display: 'grid'}}>
                <div style={{display: "flex", position: "relative"}}>
                    <h2>Tasks</h2>
                    <Dropdown options={["All", "Done", "Undone"]} onSelect={setSelectedOption}></Dropdown>
                </div>
                {showTasks.map(task => (
                    <Box>
                        <li key={task.id} className={task.completed ? 'completed' : ''} style={{marginTop: '10px'}}>
                            {editingTaskId === task.id ? (
                                <form onSubmit={saveTaskHandler}>
                                    <input
                                        type="text"
                                        value={editingTitle}
                                        onChange={e => setEditingTitle(e.target.value)}
                                        style={{
                                            marginTop: '10px',
                                            border: 'None',
                                            backgroundColor: '#f5f5f5',
                                            outline: 'none',
                                            fontSize: '16px'
                                        }}
                                    />
                                    <button type="submit" style={{
                                        backgroundColor: 'blueviolet',
                                        border: '1px solid #ddd',
                                        borderRadius: '6px',
                                        color: "white",
                                        position: "absolute",
                                        right: '0',
                                        marginRight: '10px',
                                        marginTop: '10px'
                                    }}>
                                        Save
                                    </button>
                                </form>
                            ) : (
                                <li className={task.completed ? 'completed' : ''} style={{marginTop: '10px'}}>
                                    <input type="checkbox" checked={task.completed} onChange={() => {
                                        changeStatusHandler(task.id)
                                    }}/>
                                    {task.title}
                                    <button style={{
                                        border: "none",
                                        background: "transparent",
                                        fontSize: "1em",
                                        right: '0',
                                        position: 'absolute',
                                        marginTop: '10px',
                                        marginRight: '8px',
                                    }}
                                            onClick={() => handleToggleOptions(task.id)}>
                                        •••
                                    </button>
                                </li>
                            )}
                            {selectedTaskId === task.id &&
                                <div className="popup-menu" style={{
                                    right: '0'
                                }}>
                                    <ul>
                                        <li onClick={() => handleOptionSelection("Edit")}>Edit</li>
                                        <li onClick={() => handleOptionSelection("Delete")}
                                            style={{color: 'red'}}>Delete
                                        </li>
                                    </ul>
                                </div>}
                        </li>
                    </Box>
                ))}
                <Box>
                    <form onSubmit={addTaskHandler}>
                        <input
                            type="text"
                            value={newTaskTitle}
                            onChange={(event) => setNewTaskTitle(event.target.value)}
                            placeholder="Add new task"
                            style={{border: 'none', backgroundColor: '#f5f5f5', outline: 'none', fontSize: '16px'}}
                        />
                    </form>
                </Box>
            </ul>
        </div>
    );
}

export default App;
