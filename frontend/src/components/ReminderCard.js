import { useEffect, useState } from 'react';
import { CalendarIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { apiUrl } from '../api';

export default function ReminderCard({ userToken, onNoteClick }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true); // 애니메이션 제어용

  const fetchReviews = async () => {
    try {
      const response = await fetch(apiUrl('/api/review-notes'), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        // setNotes(data);
        if (data.length === 0) {
          // 처음부터 비어있다면 컴포넌트 안 보여줌
          setIsVisible(false);
        } else {
          setNotes(data);
          setIsVisible(true);
        }
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('복습 노트 불러오기 실패: ', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userToken) {
      fetchReviews();
    }
  }, [userToken]);

  const completeReview = async (noteId) => {
    try {
      const response = await fetch(
        apiUrl(`/api/review-notes/${noteId}/check`),
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(response.json().error);
      }

      setNotes((prev) => {
        const updated = prev.filter((n) => n._id !== noteId);
        if (updated.length === 0) {
          setTimeout(() => setIsVisible(false), 300);
        }
        return updated;
      });
    } catch (error) {
      console.error('복습 완료 처리 실패: ', error);
    }
  };

  if (!userToken || loading || !isVisible) {
    return null;
  }

  return (
    <div
      className={`transition-opacity duration-300 ${
        notes.length === 0 ? 'opacity-0' : 'opacity-100'
      } bg-gradient-to-br from-blue-50 to-gray-100 rounded-2xl p-6 mt-10 shadow-lg border border-blue-100 w-[1200px] font-pretendard`}
    >
      <div className="flex items-center mb-6">
        <div className="bg-gradient-to-br from-blue-400 to-[#1B3764] p-4 rounded-xl mr-5 shadow-md">
          <CalendarIcon className="h-7 w-7 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">오늘의 복습</h2>
          <p className="text-sm text-blue-600">
            {notes.length}개의 복습할 노트가 있습니다
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {notes.map((note, idx) => (
          <button
            key={idx}
            onClick={() => {
              onNoteClick(note);
              completeReview(note._id);
            }}
            className="w-full flex items-center justify-between bg-white px-5 py-4 rounded-xl hover:bg-blue-50 transition-all duration-300 border border-blue-100 transform hover:-translate-y-0.5"
          >
            <div className="flex items-center">
              <span className="w-4 h-4 rounded-full mr-4 shadow-inner bg-yellow-400"></span>
              <span className="text-left text-gray-700 font-medium">
                {note.title}
              </span>
            </div>
            <div className="rounded-full p-1">
              <ChevronRightIcon className="w-5 h-5 text-[#1B3764]" />
            </div>
          </button>
        ))}
      </div>
    </div>

    // <div className="bg-blue-600 text-white rounded-2xl p-6 w-[1200px] shadow-md mt-10 font-pretendard">
    //   <div className="flex items-center mb-4">
    //     <div className="bg-blue-500 p-3 rounded-full mr-4">
    //       <CalendarIcon className="h-6 w-6" />
    //     </div>
    //     <div>
    //       <h2 className="text-xl font-semibold">오늘의 복습</h2>
    //       <p className="text-sm text-blue-100">
    //         {notes.length}개의 복습할 노트가 있습니다
    //       </p>
    //     </div>
    //   </div>

    //   <div className="space-y-3">
    //     {notes.map((note, idx) => (
    //       <button
    //         key={idx}
    //         onClick={() => {
    //           onNoteClick(note);
    //           completeReview(note._id);
    //           setNotes((prev) => prev.filter((n) => n._id !== note._id));
    //         }}
    //         className="w-full flex items-center justify-between bg-blue-500 px-4 py-3 rounded-lg hover:bg-blue-400 transition"
    //       >
    //         <div className="flex items-center">
    //           <span
    //             className={`w-3 h-3 rounded-full mr-3`}
    //             style={{ backgroundColor: note.color }}
    //           ></span>
    //           <span className="text-left">{note.title}</span>
    //         </div>
    //         <ChevronRightIcon className="w-4 h-4 text-white" />
    //       </button>
    //     ))}
    //   </div>

    //   {/* 복습 전체 버튼이 필요하면 아래 주석 해제 */}
    //   {/*
    //   <hr className="my-4 border-blue-400" />
    //   <button
    //     onClick={onReviewAll}
    //     className="bg-white text-blue-600 font-semibold py-2 px-4 rounded-xl hover:bg-blue-100 transition"
    //   >
    //     모든 노트 복습하기
    //   </button>
    //   */}
    // </div>
  );
}
