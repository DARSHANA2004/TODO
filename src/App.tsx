import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  Calendar, 
  AlertTriangle, 
  Tag, 
  Search, 
  SlidersHorizontal, 
  Check, 
  Sparkles, 
  CheckSquare,
  Edit2,
  Sun,
  Moon,
  ListTodo
} from 'lucide-react';
import { Toaster, toast } from 'sonner';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
  dueDate: string;
  createdAt: string;
}

const CATEGORIES = ['Work', 'Personal', 'Shopping', 'Health', 'Finance', 'Others'];
const PRIORITIES = [
  { value: 'low', label: 'Low', color: 'text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  { value: 'medium', label: 'Medium', color: 'text-amber-500 dark:text-amber-400 bg-amber-500/10 border-amber-500/20' },
  { value: 'high', label: 'High', color: 'text-rose-500 dark:text-rose-400 bg-rose-500/10 border-rose-500/20' }
];

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [inputText, setInputText] = useState('');
  const [category, setCategory] = useState('Work');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState('');
  
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'createdAt' | 'dueDate' | 'priority'>('createdAt');
  
  // Inline editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  // Handle theme syncing
  useEffect(() => {
    const savedTheme = localStorage.getItem('aura_todo_theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.className = savedTheme;
    } else {
      document.documentElement.className = 'dark';
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.className = nextTheme;
    localStorage.setItem('aura_todo_theme', nextTheme);
    toast.success(`Theme switched to ${nextTheme === 'dark' ? 'Dark Mode' : 'Light Mode'}`, {
      icon: nextTheme === 'dark' ? <Moon className="w-4 h-4 text-purple-400" /> : <Sun className="w-4 h-4 text-amber-500" />
    });
  };

  // Load tasks from localStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem('aura_todo_tasks');
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch (e) {
        console.error('Failed to parse saved tasks', e);
      }
    }
  }, []);

  // Save tasks to localStorage
  const saveTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
    localStorage.setItem('aura_todo_tasks', JSON.stringify(newTasks));
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) {
      toast.error('Please enter a task description');
      return;
    }

    const newTask: Task = {
      id: crypto.randomUUID(),
      text: inputText.trim(),
      completed: false,
      priority,
      category,
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };

    const updatedTasks = [newTask, ...tasks];
    saveTasks(updatedTasks);
    
    setInputText('');
    setDueDate('');
    toast.success('Task created successfully!', {
      description: `"${newTask.text.substring(0, 20)}${newTask.text.length > 20 ? '...' : ''}" added to ${newTask.category}`
    });
  };

  const handleToggleTask = (id: string) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === id) {
        const completed = !task.completed;
        if (completed) {
          toast.success('Task completed! 🎉');
        }
        return { ...task, completed };
      }
      return task;
    });
    saveTasks(updatedTasks);
  };

  const handleDeleteTask = (id: string) => {
    const taskToDelete = tasks.find(t => t.id === id);
    const updatedTasks = tasks.filter(task => task.id !== id);
    saveTasks(updatedTasks);
    if (taskToDelete) {
      toast.info('Task deleted', {
        description: `"${taskToDelete.text.substring(0, 20)}..." was removed.`
      });
    }
  };

  const startEditing = (task: Task) => {
    setEditingId(task.id);
    setEditText(task.text);
  };

  const saveEdit = (id: string) => {
    if (!editText.trim()) {
      toast.error('Task description cannot be empty');
      return;
    }
    const updatedTasks = tasks.map(task => 
      task.id === id ? { ...task, text: editText.trim() } : task
    );
    saveTasks(updatedTasks);
    setEditingId(null);
    toast.success('Task updated');
  };

  // Metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const activeTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const highPriorityCount = tasks.filter(t => !t.completed && t.priority === 'high').length;

  // Filter & Sort
  const filteredTasks = tasks
    .filter(task => {
      const matchesSearch = task.text.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = 
        statusFilter === 'all' ? true :
        statusFilter === 'completed' ? task.completed : !task.completed;
      const matchesPriority = priorityFilter === 'all' ? true : task.priority === priorityFilter;
      const matchesCategory = categoryFilter === 'all' ? true : task.category === categoryFilter;
      
      return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'dueDate') {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (sortBy === 'priority') {
        const priorityWeight = { high: 3, medium: 2, low: 1 };
        return priorityWeight[b.priority] - priorityWeight[a.priority];
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300">
      {/* Background ambient auroras */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/5 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full filter blur-3xl pointer-events-none" />

      {/* Navbar Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/60 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800/60 transition-colors duration-300">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <ListTodo className="w-5.5 h-5.5" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-purple-600 to-indigo-500 dark:from-purple-400 dark:to-indigo-300 bg-clip-text text-transparent">
                AuraTasks
              </span>
              <span className="text-[10px] block font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest -mt-0.5">
                Workspace
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 shadow-sm transition-all"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="relative max-w-5xl mx-auto px-4 py-8 z-10">
        
        {/* Welcome Stats Summary */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-slate-200 dark:border-slate-800/80 gap-6">
          <div>
            <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-bold text-xs mb-1 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Empower Your Day
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-heading">
              Task Dashboard
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage priorities, track goals, and boost productivity.</p>
          </div>

          {/* Progress Card */}
          <div className="flex items-center gap-5 bg-white dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm min-w-[280px]">
            <div className="relative w-12 h-12 flex items-center justify-center flex-shrink-0">
              <svg className="absolute w-full h-full transform -rotate-90">
                <circle cx="24" cy="24" r="21" className="stroke-slate-100 dark:stroke-slate-800" strokeWidth="3.5" fill="transparent" />
                <circle 
                  cx="24" 
                  cy="24" 
                  r="21" 
                  className="stroke-purple-500 dark:stroke-purple-400 transition-all duration-500 ease-out" 
                  strokeWidth="3.5" 
                  fill="transparent" 
                  strokeDasharray={2 * Math.PI * 21}
                  strokeDashoffset={2 * Math.PI * 21 * (1 - completionRate / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <span className="text-xs font-bold text-slate-800 dark:text-white">{completionRate}%</span>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">Progress</span>
                <span className="text-xs text-slate-700 dark:text-slate-300 font-bold">{completedTasks}/{totalTasks} Done</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {activeTasks} Active
                </span>
                {highPriorityCount > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> {highPriorityCount} Urgent
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Workspace Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Form Card */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm sticky top-24">
              <h2 className="text-md font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Plus className="w-4.5 h-4.5 text-purple-500 dark:text-purple-400" /> Create Task
              </h2>
              
              <form onSubmit={handleAddTask} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                    Task Description
                  </label>
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Enter what you want to achieve..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-purple-500/50 dark:focus:border-purple-400/50 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                      Tag
                    </label>
                    <div className="relative">
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full appearance-none bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-purple-500/50 dark:focus:border-purple-400/50 transition-colors"
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      <Tag className="absolute right-4 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-purple-500/50 dark:focus:border-purple-400/50 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                    Priority
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {PRIORITIES.map(p => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => setPriority(p.value as 'low' | 'medium' | 'high')}
                        className={`py-2 text-xs font-semibold rounded-xl border text-center transition-all ${
                          priority === p.value 
                            ? 'bg-purple-500 dark:bg-purple-600 border-purple-500 text-white shadow-sm shadow-purple-500/10' 
                            : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-850 text-slate-400 dark:text-slate-550 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold text-sm py-3 px-4 rounded-xl shadow-lg shadow-indigo-500/15 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Plus className="w-4.5 h-4.5" /> Add New Task
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Controls and Task Cards */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Filter Control Board */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by keyword..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-450 focus:outline-none focus:border-purple-500/50 dark:focus:border-purple-400/50 transition-colors"
                  />
                </div>
                
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full sm:w-44 appearance-none bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 pr-8 text-sm text-slate-600 dark:text-slate-350 focus:outline-none"
                  >
                    <option value="createdAt">Date Created</option>
                    <option value="dueDate">Due Date</option>
                    <option value="priority">Priority</option>
                  </select>
                  <SlidersHorizontal className="absolute right-3.5 top-3 w-4 h-4 text-slate-450 pointer-events-none" />
                </div>
              </div>

              {/* Status and Category Badges */}
              <div className="flex flex-wrap gap-2 pt-2.5 border-t border-slate-100 dark:border-slate-805 items-center justify-between">
                <div className="flex gap-1.5">
                  {(['all', 'active', 'completed'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setStatusFilter(tab)}
                      className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all uppercase tracking-wider ${
                        statusFilter === tab 
                          ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20' 
                          : 'text-slate-450 dark:text-slate-450 hover:text-slate-700 dark:hover:text-slate-300 border border-transparent'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-slate-55 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-500 dark:text-slate-400 focus:outline-none"
                  >
                    <option value="all">All Tags</option>
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>

                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="bg-slate-55 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-500 dark:text-slate-400 focus:outline-none"
                  >
                    <option value="all">All Priorities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Render list of Tasks */}
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {filteredTasks.length > 0 ? (
                  filteredTasks.map(task => {
                    const currentPriority = PRIORITIES.find(p => p.value === task.priority);
                    const isEditing = editingId === task.id;

                    return (
                      <motion.div
                        layout
                        key={task.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ duration: 0.22 }}
                        className={`group bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4.5 flex items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all ${
                          task.completed ? 'opacity-60 dark:opacity-50' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3.5 flex-1 min-w-0">
                          {/* Circle toggle button */}
                          <button
                            onClick={() => handleToggleTask(task.id)}
                            className="text-slate-450 hover:text-purple-500 dark:hover:text-purple-400 transition-colors flex-shrink-0"
                          >
                            {task.completed ? (
                              <CheckCircle2 className="w-5.5 h-5.5 text-purple-500 dark:text-purple-400" />
                            ) : (
                              <Circle className="w-5.5 h-5.5" />
                            )}
                          </button>

                          <div className="flex-1 min-w-0">
                            {isEditing ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  onKeyDown={(e) => e.key === 'Enter' && saveEdit(task.id)}
                                  className="flex-1 bg-slate-50 dark:bg-slate-950 border border-purple-500/50 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none"
                                  autoFocus
                                />
                                <button 
                                  onClick={() => saveEdit(task.id)}
                                  className="p-2 bg-purple-500 hover:bg-purple-600 rounded-xl text-white shadow-sm"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div>
                                <p className={`text-sm text-slate-800 dark:text-slate-100 font-semibold break-words tracking-tight ${
                                  task.completed ? 'line-through text-slate-400 dark:text-slate-550' : ''
                                }`}>
                                  {task.text}
                                </p>
                                
                                <div className="flex flex-wrap gap-2 mt-2 items-center">
                                  <span className={`text-[9px] px-2 py-0.5 rounded-md font-bold border ${currentPriority?.color}`}>
                                    {task.priority}
                                  </span>
                                  
                                  <span className="text-[9px] px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-450 flex items-center gap-1 font-semibold">
                                    <Tag className="w-2.5 h-2.5" /> {task.category}
                                  </span>

                                  <span className="text-[9px] text-slate-400 dark:text-slate-500 flex items-center gap-1 font-semibold">
                                    <Calendar className="w-3 h-3" /> {task.dueDate}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Interactive edit/delete controls */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!isEditing && !task.completed && (
                            <button
                              onClick={() => startEditing(task)}
                              className="p-2 text-slate-450 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-slate-50 dark:hover:bg-slate-950 rounded-xl transition-colors"
                              title="Edit task"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-2 text-slate-450 hover:text-rose-500 hover:bg-slate-50 dark:hover:bg-slate-950 rounded-xl transition-colors"
                            title="Delete task"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-dashed rounded-2xl p-12 text-center"
                  >
                    <CheckSquare className="w-10 h-10 text-slate-350 dark:text-slate-700 mx-auto mb-3" />
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-bold">Workspace is clean</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">There are no tasks matching your filters.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-8 mt-16 text-center border-t border-slate-200 dark:border-slate-850/60 bg-white/40 dark:bg-slate-955/40 text-xs text-slate-400 dark:text-slate-500">
        <p>© 2026 AuraTasks. Build & Deploy to Cloudflare Pages.</p>
      </footer>

      {/* Global notifications toaster */}
      <Toaster position="bottom-right" richColors />
    </div>
  );
}
