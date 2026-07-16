import React, { useState, useEffect, useRef } from 'react';
import Message from '../components/Message';
import Input from '../components/Input';
import { SiProbot } from 'react-icons/si';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { apiUrl } from '../api';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const messagesEndRef = useRef(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const addMessage = (sender, message) => {
    setMessages((prevMessages) => [...prevMessages, { sender, message }]);
  };

  const handleSendMessage = async (message) => {
    const userMessage = { sender: 'User', message };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    try {
      setIsLoadingChat(true);
      const response = await fetch(apiUrl('/api/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (response.status === 429) {
        addMessage(
          'Chatbot',
          '1시간에 최대 50개의 질문만 가능합니다. 잠시 후 다시 시도해주세요.'
        );
        return;
      }

      const data = await response.json();
      addMessage('Chatbot', data.reply);
    } catch (error) {
      console.error('Error:', error);
      addMessage(
        'Chatbot',
        '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
      );
    } finally {
      setIsLoadingChat(false);
    }
  };

  const handleSummarize = async () => {
    if (isLoadingChat) {
      alert('에듀봇 답변이 끝난 뒤 요약해주세요.');
      return;
    }

    if (messages.length === 0) {
      alert('대화 내용이 없습니다.');
      return;
    }

    const summaryPrompt =
      '지금까지의 대화를 최대한 상세하고 길게 요약해줘. 학습노트처럼 정리해줘.';
    setIsSummarizing(true);

    try {
      const response = await fetch(apiUrl('/api/summarize'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages,
          prompt: summaryPrompt,
          email: user.email,
        }),
      });

      if (response.ok) {
        navigate('/'); // 요약 완료 후 홈으로 이동
      } else {
        alert('요약 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('요약 중 오류:', error);
      alert('요약 중 오류가 발생했습니다.');
    } finally {
      setIsSummarizing(false);
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      setIsInitialized(true);
    }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex items-center justify-center min-h-screen flex-col font-pretendard">
      {/* ✅ 요약 중 오버레이 */}
      {isSummarizing && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-30 z-50 flex flex-col items-center justify-center">
          <div className="flex items-center bg-white px-6 py-4 rounded-xl shadow-lg">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-blue-800 text-lg font-semibold">
              요약 생성 중입니다. 잠시만 기다려주세요...
            </span>
          </div>
        </div>
      )}

      {/* 헤더 */}
      <div className="w-full p-5 bg-[#1B3764] text-white text-center font-bold text-3xl fixed top-0 left-0 z-10 flex items-center justify-center">
        EduBot
        <SiProbot className="ml-2 text-3xl" />
      </div>

      {/* 채팅 UI */}
      <div className="w-[1000px] bg-white rounded-lg flex flex-col mt-16">
        <div
          className={`p-5 flex-1 overflow-y-auto space-y-3 transition-all ${
            isInitialized ? 'pt-10' : ''
          }`}
        >
          {messages.length === 0 && !isLoadingChat && (
            <div className="text-center text-gray-500 text-2xl mb-10">
              궁금한 것을 무엇이든 물어보세요!
            </div>
          )}

          {messages.map((msg, index) => (
            <Message key={index} sender={msg.sender} message={msg.message} />
          ))}

          {/* ✅ 채팅 응답 대기 로딩 표시 */}
          {isLoadingChat && (
            <div className="flex justify-start mt-4 mb-10">
              <div className="bg-gray-100 text-gray-900 p-4 rounded-lg rounded-bl-none max-w-[80%]">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-3 h-3 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  ></div>
                  <div
                    className="w-3 h-3 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0.4s' }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 입력창 */}
        <Input
          messages={messages}
          onSendMessage={handleSendMessage}
          onSummarize={handleSummarize}
          isLoadingChat={isLoadingChat}
        />
      </div>
    </div>
  );
};

export default Chatbot;
