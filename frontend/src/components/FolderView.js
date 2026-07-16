import { useEffect, useState } from 'react';
import Notebook from './Notebook';
import NotebookDetail from './NotebookDetail';
import { BookOpenIcon } from '@heroicons/react/24/outline';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import { apiUrl } from '../api';

export default function FolderView({ folder, token, onBack }) {
  const [notes, setNotes] = useState([]);
  const [selectedNotebook, setSelectedNotebook] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchFolderNotes = async (token) => {
    setLoading(true);
    try {
      const response = await fetch(
        apiUrl(`/api/folders/${folder._id}/notes`),
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      setNotes(data.notes);
    } catch (error) {
      console.error('폴더 노트 불러오기 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (folder && token) {
      fetchFolderNotes(token);
    }
  }, [folder, token]);

  const handleNoteClick = (note) => {
    setSelectedNotebook(note);
    setDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailOpen(false);
  };

  return (
    <div className="flex flex-col flex-1 pb-10 mt-12 w-[1200px] font-pretendard">
      <div className="flex flex-col space-y-4 mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-blue-600 transition-colors duration-200 w-fit"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          <span className="text-sm font-medium">뒤로가기</span>
        </button>

        <div className="flex items-center">
          <h2 className="text-xl font-bold text-gray-800 pb-1">
            {folder.name}
          </h2>
          <span className="ml-2 bg-gray-100 text-gray-500 text-xs font-medium px-2 py-1 rounded-full">
            {notes?.length || '0'}개 노트
          </span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : notes?.length > 0 ? (
        <div className="grid grid-cols-5 gap-10">
          {notes.map((note, index) => (
            <Notebook
              key={`note-${index}`}
              createdAt={note.createdAt}
              title={note.title}
              onClick={() => handleNoteClick(note)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg p-10 text-center h-80 border-2 border-dashed border-gray-300">
          <BookOpenIcon className="h-12 w-12 mb-2 text-gray-700" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">
            폴더에 존재하는 노트가 없습니다
          </h3>
          <p className="text-gray-500">이 폴더에 노트를 추가해 보세요.</p>
        </div>
      )}

      <NotebookDetail
        isOpen={detailOpen}
        onClose={handleCloseDetail}
        notebook={selectedNotebook || {}}
        userToken={token}
        onSuccess={() => fetchFolderNotes(token)}
      />
      {detailOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-20 z-10"
          onClick={handleCloseDetail}
        />
      )}
    </div>
  );
}
