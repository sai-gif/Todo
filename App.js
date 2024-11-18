import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet, Text, TextInput, View,
  FlatList, TouchableOpacity, Animated
} from 'react-native';
import Checkbox from './Checkbox';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingText, setEditingText] = useState('');

  // Ref to store animated opacity values separately from state
  const opacityValues = useRef({});

  const addTask = () => {
    if (task.trim()) {
      const newTask = { id: Date.now().toString(), text: task, completed: false };
      setTasks([...tasks, newTask]);
      opacityValues.current[newTask.id] = new Animated.Value(1); // Initialize opacity value to 1 (fully visible)
      setTask('');
    }
  };

  const deleteTask = (taskId) => {
    const animatedOpacity = opacityValues.current[taskId];
    if (animatedOpacity) {
      Animated.timing(animatedOpacity, {
        toValue: 0, // Fade out to opacity 0
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setTasks(currentTasks => currentTasks.filter(task => task.id !== taskId));
        delete opacityValues.current[taskId]; // Clean up opacity value after deletion
      });
    }
  };

  const toggleTask = (taskId) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const confirmEditTask = (taskId) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, text: editingText } : task
    ));
    setEditingTaskId(null);
    setEditingText('');
  };

  const cancelEditTask = () => {
    setEditingTaskId(null);
    setEditingText('');
  };

  useEffect(() => {
    loadTasks().then((loadedTasks) => setTasks(loadedTasks));
  }, []);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  const saveTasks = async (tasks) => {
    try {
      const jsonValue = JSON.stringify(tasks);
      await AsyncStorage.setItem('tasks', jsonValue);
    } catch (e) {
      console.error("Failed to save tasks.");
    }
  };

  const loadTasks = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('tasks');
      const loadedTasks = jsonValue != null ? JSON.parse(jsonValue) : [];
      // Initialize opacity values for loaded tasks
      loadedTasks.forEach(task => {
        opacityValues.current[task.id] = new Animated.Value(1); // Start with opacity 1
      });
      return loadedTasks;
    } catch (e) {
      console.error("Failed to load tasks:", e);
      return [];
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Simple To-Do List</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a new task"
          value={task}
          onChangeText={(text) => setTask(text)}
        />
        <TouchableOpacity style={styles.addButton} onPress={addTask}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={tasks}
        renderItem={({ item }) => (
          <Animated.View style={[
            styles.taskContainer,
            { opacity: opacityValues.current[item.id] || 1 }
          ]}>
            <Checkbox
              label=""
              initialValue={item.completed}
              onValueChange={() => toggleTask(item.id)}
            />
            {editingTaskId === item.id ? (
              <View style={styles.editContainer}>
                <TextInput
                  style={styles.input}
                  value={editingText}
                  onChangeText={setEditingText}
                  onBlur={cancelEditTask}
                />
                <TouchableOpacity onPress={() => confirmEditTask(item.id)}>
                  <Text style={styles.okButton}>OK</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={() => {
                setEditingTaskId(item.id);
                setEditingText(item.text);
              }}>
                <Text style={[styles.taskText, item.completed && styles.completedTask]}>
                  {item.text}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => deleteTask(item.id)}>
              <Text style={styles.deleteButton}>X</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  addButton: {
    backgroundColor: '#5C5CFF',
    height: 40,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    marginLeft: 10,
  },
  addButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  taskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
    justifyContent: 'space-between',
  },
  taskText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  deleteButton: {
    color: '#FF5C5C',
    fontWeight: 'bold',
    fontSize: 18,
  },
  completedTask: {
    textDecorationLine: 'line-through',
    color: 'grey',
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '70%',
  },
  okButton: {
    color: '#5C5CFF',
    fontWeight: 'bold',
    marginLeft: 10,
  },
});