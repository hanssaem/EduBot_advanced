import { useState } from 'react';
import Modal from './Modal';
import { FolderPlusIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';
import { apiUrl } from '../api';

export default function CreateFolder({ userToken, onSuccess }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isGuide, setIsGuide] = useState(false);
  const [folderName, setFolderName] = useState('');

  const createFolder = async (name) => {
    try {
      const response = await fetch(apiUrl('/api/folders'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();

      if (response.status === 409) {
        alert(`${data.error}`);
        return;
      }

      if (!response.ok) {
        throw new Error(data.error);
      }

      onSuccess();
      handleCloseModal();
    } catch (error) {
      console.log('폴더 생성 실패: ', error);
    }
  };

  const handleCreate = () => {
    if (folderName.trim() === '') {
      alert('폴더명을 입력해주세요!');
      return;
    }

    createFolder(folderName);
  };

  const handleCloseModal = () => {
    setIsOpen(false);
    setTimeout(() => {
      setFolderName('');
    }, 300);
  };

  const handleNavigate = () => {
    navigate('/login');
  };

  const handleCloseGuideModal = () => {
    setIsGuide(false);
  };

  return (
    <>
      <button
        className="relative w-full h-64 bg-gradient-to-br from-blue-50 to-gray-100 rounded-lg border-2 border-dashed border-blue-400 shadow-md hover:shadow-lg transition-all duration-300 flex flex-col items-center justify-center"
        onClick={userToken ? () => setIsOpen(true) : () => setIsGuide(true)}
      >
        <FolderPlusIcon className="h-10 w-10 text-[#1B3764]" />
        <span className="text-[#1B3764] text-md font-medium mt-4">
          폴더 생성하기
        </span>
      </button>

      <Modal
        isOpen={isOpen}
        title="새 폴더 생성"
        content={
          <div className="flex flex-col gap-4">
            <p className="text-gray-600 text-sm">
              생성할 폴더 이름을 입력하세요.
            </p>
            <input
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              className="input input-bordered w-full p-2 border rounded-md"
              placeholder="폴더 이름"
            />
          </div>
        }
        confirmText="확인"
        onClose={handleCloseModal}
        onConfirm={handleCreate}
      />

      <Modal
        isOpen={isGuide}
        title="로그인이 필요한 기능입니다."
        content={
          <p className="text-gray-600 text-sm">
            확인을 누르시면 로그인 화면으로 이동합니다.
          </p>
        }
        confirmText="확인"
        onClose={handleCloseGuideModal}
        onConfirm={handleNavigate}
      />
    </>
  );
}
