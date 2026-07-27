import { SiProbot } from 'react-icons/si';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';

import Folder from '../components/Folder';
import Notebook from '../components/Notebook';
import NotebookDetail from '../components/NotebookDetail';
import ReminderCard from '../components/ReminderCard';
import CreateFolder from '../components/CreateFolder';
import FolderView from '../components/FolderView';
import PdfStudy from '../components/PdfStudy';
import { apiUrl } from '../api';

export default function Home() {
  const navigate = useNavigate();
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [selectedNotebook, setSelectedNotebook] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [userToken, setUserToken] = useState(null);
  const [notes, setNotes] = useState([]); // Combined array for folders and notebooks
  const [folders, setFolders] = useState([]);
  const auth = getAuth();

  const fetchFolders = async (token) => {
    try {
      const response = await fetch(apiUrl('/api/folders'), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      setFolders(data.folders);
    } catch (error) {
      console.error('폴더 가져오기 실패: ', error);
    }
  };

  const fetchNotes = async (token) => {
    try {
      const response = await fetch(
        apiUrl('/api/notes/no-folder'),
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
      console.error('노트 가져오기 실패: ', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        try {
          const token = await currentUser.getIdToken(); // Firebase 인증 토큰 가져오기
          setUserToken(token);
          fetchFolders(token);
          fetchNotes(token);
        } catch (error) {
          console.error('노트 가져오기 실패:', error);
        }
      }
    });

    return () => unsubscribe();
  }, [auth]);

  // 🔥 로그아웃 함수
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserToken(null);
      setNotes([]);
      setFolders([]);
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  const handleStartClick = () => {
    if (user) {
      navigate('/chatbot');
    } else {
      // 로그인 후 돌아올 페이지 정보를 state로 전달
      navigate('/login', { state: { from: '/chatbot' } });
    }
  };

  const handleFolderClick = (folder) => {
    setSelectedFolder(folder);
  };

  const handleNoteClick = (note) => {
    setSelectedNotebook(note);
    setDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white items-center font-pretendard">
      <nav className="w-full p-5 bg-[rgb(27,55,100)] text-white flex items-center">
        <div className="flex-1"></div>

        <button
          className="font-bold text-3xl flex items-start justify-center"
          onClick={() => navigate('/')}
        >
          EduBot
          <SiProbot className="ml-2 text-3xl inline-block" />
        </button>

        <div className="flex-1 flex justify-end pr-5 items-center gap-4">
          {user ? (
            <>
              <span className="text-sm">{user.email}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white text-md px-3 py-1 rounded"
              >
                로그아웃
              </button>
            </>
          ) : (
            <button onClick={() => navigate('/login')}>로그인</button>
          )}
        </div>
      </nav>
      {/* 학습 메이트 안내 섹션 */}
      <div className="flex flex-col items-center justify-center w-full bg-[#1B3764] text-center py-20 gap-4">
        <h1 className="text-4xl font-bold text-white">AI 학습 메이트</h1>
        <div className="w-16 h-1 bg-yellow-400 mx-auto my-4"></div>
        <p className="text-lg text-[#B4C7E7]">
          AI와 대화하며 배우고, 자동으로 요약된 학습 기록을 언제든지 확인하세요.
        </p>
        <button
          className="px-[40px] py-[18px] bg-yellow-400 rounded-3xl"
          onClick={handleStartClick}
        >
          {user ? '에듀봇과 공부하기' : '로그인하고 시작하기'}
        </button>
      </div>

      {selectedFolder ? (
        <FolderView
          folder={selectedFolder}
          token={userToken}
          onBack={() => {
            setSelectedFolder(null);
            fetchNotes(userToken);
          }}
        />
      ) : (
        <>
          <ReminderCard
            userToken={userToken}
            onNoteClick={(note) => {
              setSelectedNotebook(note);
              setDetailOpen(true);
            }}
          />

          <PdfStudy
            userToken={userToken}
            onSummaryCreated={() => fetchNotes(userToken)}
          />

          <div className="flex flex-col flex-1 pb-10 mt-12 w-[1200px]">
            <h1 className="text-xl font-bold mb-6">학습 요약본</h1>
            <div className="grid grid-cols-5 gap-10">
              <CreateFolder
                userToken={userToken}
                onSuccess={() => fetchFolders(userToken)}
              />

              {folders?.map((folder, index) => (
                <Folder
                  key={`folder-${index}`}
                  name={folder.name}
                  onClick={() => handleFolderClick(folder)}
                />
              ))}

              {notes?.map((note, index) => (
                <Notebook
                  key={`note-${index}`}
                  createdAt={note.createdAt}
                  title={note.title}
                  onClick={() => handleNoteClick(note)}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {/* Notebook Detail Panel */}
      <NotebookDetail
        isOpen={detailOpen}
        onClose={handleCloseDetail}
        notebook={selectedNotebook || {}}
        userToken={userToken}
        onSuccess={() => fetchNotes(userToken)}
      />
      {/* Semi-transparent overlay when detail is open */}
      {detailOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-20 z-10"
          onClick={handleCloseDetail}
        />
      )}
    </div>
  );
}
