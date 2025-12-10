'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { Loader2, Plus, Trash2, Edit, X, ChevronRight, Search, Save } from 'lucide-react';

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

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

// Field definitions for known courses
const COURSE_FIELDS: Record<string, { name: string; label: string; type?: string }[]> = {
  '1': [ // Alphabet
    { name: 'character', label: 'Character' },
    { name: 'name', label: 'Name' },
    { name: 'pronunciation', label: 'Pronunciation' },
    { name: 'audioUrl', label: 'Audio URL' },
  ],
  '2': [ // Numbers
    { name: 'number', label: 'Number' },
    { name: 'translation', label: 'Translation' },
    { name: 'translationLatin', label: 'Translation (Latin)' },
  ],
  '3': [ // Words
    { name: 'english', label: 'English' },
    { name: 'georgian', label: 'Georgian' },
    { name: 'latin', label: 'Latin' },
    { name: 'transcription', label: 'Transcription' },
    { name: 'audioUrl', label: 'Audio URL' },
  ]
};

export default function AdminPage() {
  const { currentUser, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [checkingAdmin, setCheckingAdmin] = useState<boolean>(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [items, setItems] = useState<CourseItem[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(false);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Editor states
  const [isEditingCourse, setIsEditingCourse] = useState<boolean>(false);
  const [courseForm, setCourseForm] = useState<Course>({ id: '' });
  
  const [isEditingItem, setIsEditingItem] = useState<boolean>(false);
  const [itemForm, setItemForm] = useState<CourseItem>({ id: '' });
  const [isJsonMode, setIsJsonMode] = useState<boolean>(false); // Toggle between Form and JSON

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
    setSearchQuery("");
    setIsEditingCourse(false);
    setIsEditingItem(false);
    fetchItems(course.id);
  };

  const filteredItems = useMemo(() => {
    if (!searchQuery) return items;
    const lowerQuery = searchQuery.toLowerCase();
    return items.filter(item => 
      Object.values(item).some(val => 
        String(val).toLowerCase().includes(lowerQuery)
      )
    );
  }, [items, searchQuery]);

  const handleSaveCourse = async () => {
    try {
      const courseId = courseForm.id || (selectedCourse ? selectedCourse.id : Date.now().toString());
      const data = { ...courseForm };
      if (!data.id) data.id = courseId;
      
      await setDoc(doc(db, 'courses', courseId), data);
      
      setIsEditingCourse(false);
      fetchCourses();
      if (selectedCourse && selectedCourse.id === courseId) {
        setSelectedCourse({ ...data, id: courseId });
      }
    } catch (error) {
      alert("Error saving course: " + error);
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
      const itemId = itemForm.id ? String(itemForm.id) : Date.now().toString();
      const data = { ...itemForm };
      if (!data.id) data.id = itemId;
      
      // Convert numeric ID if it looks like a number (optional, but good for consistency)
      // if (!isNaN(Number(itemId))) data.id = Number(itemId); 
      // Actually, Firestore IDs are strings. Let's keep it simple.

      await setDoc(doc(db, 'courses', selectedCourse.id, 'items', itemId), data);
      
      setIsEditingItem(false);
      fetchItems(selectedCourse.id);
    } catch (error) {
      alert("Error saving item: " + error);
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
      setCourseForm({ ...course });
    } else {
      setCourseForm({ id: "", title: "New Course" });
    }
    setIsEditingCourse(true);
  };

  const startEditItem = (item?: CourseItem) => {
    if (item) {
      setItemForm({ ...item });
    } else {
      // Default template
      const template: any = { id: "" };
      // Pre-fill fields based on course type
      if (selectedCourse) {
        const fields = COURSE_FIELDS[selectedCourse.id];
        if (fields) {
          fields.forEach(f => template[f.name] = "");
        }
      }
      setItemForm(template);
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
        <Button onClick={() => router.push('/login')}>Go to Login</Button>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <header className="bg-white shadow-sm p-4 flex justify-between items-center border-b">
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
            <Button variant="ghost" size="icon" onClick={() => startEditCourse()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1">
            {courses.map(course => (
              <div 
                key={course.id}
                onClick={() => handleSelectCourse(course)}
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 flex justify-between items-center transition-colors ${selectedCourse?.id === course.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
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
            <div className="space-y-6 max-w-5xl mx-auto">
              {/* Course Header */}
              <Card>
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-2xl font-bold">{selectedCourse.title || selectedCourse.id}</CardTitle>
                    <CardDescription>ID: {selectedCourse.id}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => startEditCourse(selectedCourse)}>
                      <Edit className="h-4 w-4 mr-2" /> Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteCourse(selectedCourse.id)}>
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {selectedCourse.description && (
                    <p className="text-gray-700">{selectedCourse.description}</p>
                  )}
                </CardContent>
              </Card>

              {/* Items List */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <div className="flex items-center gap-4">
                    <CardTitle>Items ({items.length})</CardTitle>
                    <div className="relative w-64">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Search items..." 
                        className="pl-8" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button onClick={() => startEditItem()}>
                    <Plus className="h-4 w-4 mr-2" /> Add Item
                  </Button>
                </CardHeader>
                
                <div className="divide-y border-t">
                  {filteredItems.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      {items.length === 0 ? "No items in this course yet." : "No items match your search."}
                    </div>
                  ) : (
                    filteredItems.map(item => (
                      <div key={item.id} className="p-4 hover:bg-gray-50 flex justify-between items-center group transition-colors">
                        <div>
                          <div className="font-medium">
                            {item.name || item.character || item.number || item.english || `Item ${item.id}`}
                          </div>
                          <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-2">
                            {Object.entries(item).slice(0, 4).map(([k, v]) => (
                                k !== 'id' && typeof v === 'string' && v.length < 50 ? 
                                <span key={k} className="bg-gray-100 px-1.5 py-0.5 rounded border">{k}: {v}</span> : null
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" onClick={() => startEditItem(item)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteItem(item.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Edit Course</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsEditingCourse(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="course-id">ID</Label>
                <Input 
                  id="course-id" 
                  value={courseForm.id} 
                  onChange={(e) => setCourseForm({...courseForm, id: e.target.value})}
                  placeholder="unique-id"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="course-title">Title</Label>
                <Input 
                  id="course-title" 
                  value={courseForm.title || ''} 
                  onChange={(e) => setCourseForm({...courseForm, title: e.target.value})}
                  placeholder="Course Title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="course-desc">Description</Label>
                <Textarea 
                  id="course-desc" 
                  value={courseForm.description || ''} 
                  onChange={(e) => setCourseForm({...courseForm, description: e.target.value})}
                  placeholder="Course Description"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsEditingCourse(false)}>Cancel</Button>
                <Button onClick={handleSaveCourse}>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Item Modal */}
      {isEditingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full  shadow-xl max-h-[90vh] flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b">
              <div className="flex items-center gap-4">
                <CardTitle>{itemForm.id ? 'Edit Item' : 'New Item'}</CardTitle>
                <div className="flex items-center space-x-2">
                    <Label htmlFor="json-mode" className="text-xs">JSON Mode</Label>
                    <input 
                        type="checkbox" 
                        id="json-mode" 
                        checked={isJsonMode} 
                        onChange={(e) => setIsJsonMode(e.target.checked)}
                        className="toggle"
                    />
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsEditingItem(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            
            <CardContent className="space-y-4 pt-4 overflow-y-auto flex-1">
              {isJsonMode ? (
                 <Textarea 
                    value={JSON.stringify(itemForm, null, 2)}
                    onChange={(e) => {
                        try {
                            setItemForm(JSON.parse(e.target.value));
                        } catch (err) {
                            // Allow typing invalid JSON temporarily
                        }
                    }}
                    className="font-mono h-96"
                 />
              ) : (
                <div className="grid gap-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="item-id" className="text-right">ID</Label>
                    <Input 
                      id="item-id" 
                      value={itemForm.id} 
                      onChange={(e) => setItemForm({...itemForm, id: e.target.value})}
                      className="col-span-3"
                      placeholder="Auto-generated if empty"
                    />
                  </div>
                  
                  {/* Dynamic Fields based on Course ID */}
                  {selectedCourse && COURSE_FIELDS[selectedCourse.id] ? (
                    COURSE_FIELDS[selectedCourse.id].map((field) => (
                      <div key={field.name} className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor={`field-${field.name}`} className="text-right">{field.label}</Label>
                        <Input 
                          id={`field-${field.name}`}
                          value={itemForm[field.name] || ''}
                          onChange={(e) => setItemForm({...itemForm, [field.name]: e.target.value})}
                          className="col-span-3"
                        />
                      </div>
                    ))
                  ) : (
                    // Fallback for unknown course types
                    Object.keys(itemForm).filter(k => k !== 'id').map((key) => (
                        <div key={key} className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor={`field-${key}`} className="text-right capitalize">{key}</Label>
                            <Input 
                            id={`field-${key}`}
                            value={itemForm[key] || ''}
                            onChange={(e) => setItemForm({...itemForm, [key]: e.target.value})}
                            className="col-span-3"
                            />
                        </div>
                    ))
                  )}
                  
                  {/* Add New Field Button (Simple implementation) */}
                  {!COURSE_FIELDS[selectedCourse?.id || ''] && (
                      <div className="text-xs text-center text-gray-500 pt-2">
                          To add new fields, switch to JSON mode.
                      </div>
                  )}
                </div>
              )}
            </CardContent>
            
            <div className="p-6 border-t flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditingItem(false)}>Cancel</Button>
                <Button onClick={handleSaveItem}>Save Changes</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
