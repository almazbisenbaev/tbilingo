'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@root/firebaseConfig';
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc, 
} from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, Trash2, Edit, X, ChevronRight } from 'lucide-react';

interface Course {
  id: string;
  title?: string;
  description?: string;
  [key: string]: any;
}

interface CourseItem {
  id: string;
  [key: string]: any;
}

export default function AdminPage() {
  const { currentUser, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [checkingAdmin, setCheckingAdmin] = useState<boolean>(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [items, setItems] = useState<CourseItem[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(false);
  
  // Editor states
  const [isEditingCourse, setIsEditingCourse] = useState<boolean>(false);
  const [courseForm, setCourseForm] = useState<string>('{}');
  const [isEditingItem, setIsEditingItem] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<CourseItem | null>(null);
  const [itemForm, setItemForm] = useState<string>('{}');

  const router = useRouter();

  useEffect(() => {
    async function checkAdmin() {
      if (!currentUser) {
        setCheckingAdmin(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists() && userDoc.data().role === 'admin') {
          setIsAdmin(true);
          fetchCourses();
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      } finally {
        setCheckingAdmin(false);
      }
    }

    if (!authLoading) {
      checkAdmin();
    }
  }, [currentUser, authLoading]);

  const fetchCourses = async () => {
    setLoadingData(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'courses'));
      const coursesList: Course[] = [];
      querySnapshot.forEach((doc) => {
        coursesList.push({ id: doc.id, ...doc.data() });
      });
      // Sort by ID if it's numeric, otherwise alpha
      coursesList.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
      setCourses(coursesList);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchItems = async (courseId: string) => {
    setLoadingData(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'courses', courseId, 'items'));
      const itemsList: CourseItem[] = [];
      querySnapshot.forEach((doc) => {
        itemsList.push({ id: doc.id, ...doc.data() });
      });
      // Sort by ID if numeric
      itemsList.sort((a, b) => {
        const idA = parseInt(a.id);
        const idB = parseInt(b.id);
        if (!isNaN(idA) && !isNaN(idB)) return idA - idB;
        return a.id.localeCompare(b.id);
      });
      setItems(itemsList);
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSelectCourse = (course: Course) => {
    setSelectedCourse(course);
    setSelectedItem(null);
    setIsEditingCourse(false);
    setIsEditingItem(false);
    fetchItems(course.id);
  };

  const handleSaveCourse = async () => {
    try {
      const data = JSON.parse(courseForm);
      const courseId = data.id || (selectedCourse ? selectedCourse.id : Date.now().toString());
      
      await setDoc(doc(db, 'courses', courseId), data);
      
      setIsEditingCourse(false);
      fetchCourses();
      if (selectedCourse && selectedCourse.id === courseId) {
        setSelectedCourse({ ...data, id: courseId });
      }
    } catch (error) {
      alert("Invalid JSON or Error saving course: " + error);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm("Are you sure? This will delete the course definition. Items might remain orphaned if not deleted separately.")) return;
    try {
      await deleteDoc(doc(db, 'courses', courseId));
      if (selectedCourse?.id === courseId) setSelectedCourse(null);
      fetchCourses();
    } catch (error) {
      console.error("Error deleting course:", error);
    }
  };

  const handleSaveItem = async () => {
    if (!selectedCourse) return;
    try {
      const data = JSON.parse(itemForm);
      const itemId = data.id ? String(data.id) : (selectedItem ? selectedItem.id : Date.now().toString());
      
      await setDoc(doc(db, 'courses', selectedCourse.id, 'items', itemId), data);
      
      setIsEditingItem(false);
      setSelectedItem(null);
      fetchItems(selectedCourse.id);
    } catch (error) {
      alert("Invalid JSON or Error saving item: " + error);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!selectedCourse || !confirm("Are you sure?")) return;
    try {
      await deleteDoc(doc(db, 'courses', selectedCourse.id, 'items', itemId));
      fetchItems(selectedCourse.id);
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const startEditCourse = (course?: Course) => {
    if (course) {
      setCourseForm(JSON.stringify(course, null, 2));
    } else {
      setCourseForm(JSON.stringify({ id: "", title: "New Course" }, null, 2));
    }
    setIsEditingCourse(true);
  };

  const startEditItem = (item?: CourseItem) => {
    if (item) {
      setItemForm(JSON.stringify(item, null, 2));
      setSelectedItem(item);
    } else {
      // Default template based on course ID if possible, otherwise generic
      const template = selectedCourse?.id === '1' 
        ? { id: "", character: "", name: "", pronunciation: "", audioUrl: "" }
        : selectedCourse?.id === '2'
        ? { id: "", number: "", translation: "", translationLatin: "" }
        : { id: "", name: "" };
        
      setItemForm(JSON.stringify(template, null, 2));
      setSelectedItem(null);
    }
    setIsEditingItem(true);
  };

  if (authLoading || checkingAdmin) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!currentUser || !isAdmin) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
        <p>You do not have permission to view this page.</p>
        <p className="text-sm text-gray-500">
          Current User: {currentUser ? currentUser.email : 'Not logged in'}
        </p>
        {!currentUser && (
            <button 
                onClick={() => router.push('/login')}
                className="px-4 py-2 bg-blue-500 text-white rounded"
            >
                Go to Login
            </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <header className="bg-white shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
        <div className="text-sm text-gray-600">
          Logged in as: <span className="font-semibold">{currentUser.email}</span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Courses List */}
        <aside className="w-64 bg-white border-r overflow-y-auto flex flex-col">
          <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white z-10">
            <h2 className="font-semibold">Courses</h2>
            <button 
              onClick={() => startEditCourse()}
              className="p-1 hover:bg-gray-100 rounded-full"
              title="Add Course"
            >
              <Plus size={20} />
            </button>
          </div>
          <div className="flex-1">
            {courses.map(course => (
              <div 
                key={course.id}
                onClick={() => handleSelectCourse(course)}
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 flex justify-between items-center ${selectedCourse?.id === course.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
              >
                <span className="truncate font-medium">{course.title || course.id}</span>
                <ChevronRight size={16} className="text-gray-400" />
              </div>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {selectedCourse ? (
            <div className="space-y-6">
              {/* Course Header */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedCourse.title || selectedCourse.id}</h2>
                    <p className="text-gray-500 text-sm">ID: {selectedCourse.id}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => startEditCourse(selectedCourse)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded hover:bg-gray-50"
                    >
                      <Edit size={16} /> Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteCourse(selectedCourse.id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm border border-red-200 text-red-600 rounded hover:bg-red-50"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </div>
                {selectedCourse.description && (
                  <p className="text-gray-700">{selectedCourse.description}</p>
                )}
              </div>

              {/* Items List */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-4 border-b flex justify-between items-center">
                  <h3 className="font-semibold text-lg">Items ({items.length})</h3>
                  <button 
                    onClick={() => startEditItem()}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                  >
                    <Plus size={16} /> Add Item
                  </button>
                </div>
                
                <div className="divide-y">
                  {items.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No items in this course yet.</div>
                  ) : (
                    items.map(item => (
                      <div key={item.id} className="p-4 hover:bg-gray-50 flex justify-between items-center group">
                        <div>
                          <div className="font-medium">
                            {item.name || item.character || item.number || item.english || `Item ${item.id}`}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {Object.entries(item).slice(0, 3).map(([k, v]) => (
                                k !== 'id' && typeof v === 'string' ? <span key={k} className="mr-2 bg-gray-100 px-1 rounded">{k}: {v}</span> : null
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => startEditItem(item)}
                            className="p-1.5 text-gray-600 hover:bg-gray-200 rounded"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1.5 text-red-600 hover:bg-red-100 rounded"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              Select a course to manage its content
            </div>
          )}
        </main>
      </div>

      {/* Edit Course Modal */}
      {isEditingCourse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Edit Course</h3>
              <button onClick={() => setIsEditingCourse(false)}><X size={20} /></button>
            </div>
            <p className="text-sm text-gray-500 mb-2">Edit the JSON representation of the course.</p>
            <textarea 
              value={courseForm}
              onChange={(e) => setCourseForm(e.target.value)}
              className="w-full h-64 font-mono text-sm p-3 border rounded bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button 
                onClick={() => setIsEditingCourse(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveCourse}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {isEditingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">{selectedItem ? 'Edit Item' : 'New Item'}</h3>
              <button onClick={() => setIsEditingItem(false)}><X size={20} /></button>
            </div>
            <p className="text-sm text-gray-500 mb-2">Edit the JSON representation of the item.</p>
            <textarea 
              value={itemForm}
              onChange={(e) => setItemForm(e.target.value)}
              className="w-full h-64 font-mono text-sm p-3 border rounded bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button 
                onClick={() => setIsEditingItem(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveItem}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
