import React, { useState } from 'react';
import { HiArrowUp } from "react-icons/hi";
import { useNavigate } from 'react-router-dom';

const Input = ({ messages, onSendMessage, onSummarize, isLoadingChat }) => {
    const [input, setInput] = useState('');
    const navigate = useNavigate();

    const handleInputChange = (event) => {
        setInput(event.target.value);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (input.trim()) {
            onSendMessage(input.trim());
            setInput('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-5 flex bg-white sticky bottom-0 w-full">
            <div className="relative flex-1 flex flex-col">
                {messages.length > 0 && (
                    <div className="flex justify-center space-x-4 mb-4">
                        <button
                            type="button"
                            className="px-6 py-3 bg-yellow-400 text-white rounded-full text-xl shadow-md"
                            onClick={() => navigate('/')}
                        >
                            대화 그만하기
                        </button>
                        <button
                            type="button"
                            className="px-6 py-3 bg-yellow-400 text-white rounded-full text-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={onSummarize}
                            disabled={isLoadingChat}
                        >
                            요약하기
                        </button>
                    </div>
                )}
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={handleInputChange}
                        placeholder="메시지를 입력하세요..."
                        className="w-full p-5 text-xl border rounded-full focus:outline-none shadow-md pr-16 text-gray-500"
                    />

                    <button
                        type="submit"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-yellow-400 text-white rounded-full flex items-center justify-center shadow-md"
                    >
                        <HiArrowUp className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </form>
    );
};

export default Input;
