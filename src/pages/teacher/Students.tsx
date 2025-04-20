
import TeacherStudents from '@/components/teacher/TeacherStudents';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';

const StudentsPage = () => {
  const { user } = useAuth();

  if (user?.role !== 'teacher') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-semibold text-red-600">Access Denied</h1>
        <p className="mt-2">You need teacher access to view this page.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />
      <main className="container px-4 py-6 max-w-7xl">
        <TeacherStudents />
      </main>
    </div>
  );
};

export default StudentsPage;
