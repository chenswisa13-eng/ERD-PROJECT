// src/hooks/useFirestore.js
// Custom hooks for fetching Firestore data with loading/error states.
import { useState, useEffect } from 'react';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

// ── Generic collection fetcher ────────────────────────────────────────────────
export function useCollection(collectionName) {
  const [data, setData]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    setLoading(true);
    getDocs(collection(db, collectionName))
      .then((snap) => {
        setData(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [collectionName]);

  return { data, loading, error, setData };
}

// ── Register / unregister a student from a course ────────────────────────────
export async function registerForCourse(studentId, courseId) {
  const enrollmentId = `${studentId}_${courseId}`;
  const ref = doc(db, 'Enrollments', enrollmentId);

  const snap = await getDoc(ref);
  if (snap.exists()) {
    return { success: false, message: 'You are already registered for this course.' };
  }

  await setDoc(ref, {
    enrollmentId,
    studentId,
    courseId,
    enrollmentDate: serverTimestamp(),
    grade: null,
  });

  return { success: true, message: 'Successfully registered!' };
}

export async function unregisterFromCourse(studentId, courseId) {
  const enrollmentId = `${studentId}_${courseId}`;
  await deleteDoc(doc(db, 'Enrollments', enrollmentId));
  return { success: true };
}

// ── Fetch enrollments for a single student ───────────────────────────────────
export async function fetchStudentEnrollments(studentId) {
  const snap = await getDocs(collection(db, 'Enrollments'));
  return snap.docs
    .filter((d) => d.data().studentId === studentId)
    .map((d) => ({ id: d.id, ...d.data() }));
}

// ── Seed initial data ─────────────────────────────────────────────────────────
export async function seedInitialData() {
  const instructors = [
    { instructorId: 'inst_001', name: 'Dr. Evelyn Carter' },
    { instructorId: 'inst_002', name: 'Prof. Marcus Rivera' },
    { instructorId: 'inst_003', name: 'Dr. Aisha Patel' },
    { instructorId: 'inst_004', name: 'Prof. James Okafor' },
  ];

  const courses = [
    { courseId: 'cs101', name: 'Introduction to Computer Science', credits: 3, instructorId: 'inst_001' },
    { courseId: 'cs201', name: 'Data Structures & Algorithms',      credits: 4, instructorId: 'inst_001' },
    { courseId: 'math101', name: 'Calculus I',                      credits: 4, instructorId: 'inst_002' },
    { courseId: 'math201', name: 'Linear Algebra',                  credits: 3, instructorId: 'inst_002' },
    { courseId: 'phys101', name: 'Physics: Mechanics',              credits: 4, instructorId: 'inst_003' },
    { courseId: 'eng101', name: 'Technical Writing',                credits: 2, instructorId: 'inst_004' },
    { courseId: 'cs301', name: 'Database Systems',                  credits: 3, instructorId: 'inst_003' },
    { courseId: 'cs401', name: 'Machine Learning Fundamentals',     credits: 4, instructorId: 'inst_004' },
  ];

  const instructorPromises = instructors.map((inst) =>
    setDoc(doc(db, 'Instructors', inst.instructorId), { name: inst.name })
  );
  const coursePromises = courses.map((c) =>
    setDoc(doc(db, 'Courses', c.courseId), {
      name: c.name,
      credits: c.credits,
      instructorId: c.instructorId,
    })
  );

  await Promise.all([...instructorPromises, ...coursePromises]);
  return { instructors: instructors.length, courses: courses.length };
}
