// src/pages/LoginPromptGallery.jsx
import { useEffect, useState } from 'react';
import { fetchExamplePrompts } from '../utils/fetchExamplePrompts';
import ExamplePromptCard from '../components/ExamplePromptCard';

export default function LoginPromptGallery({ onPromptSelect }) {
  const [prompts, setPrompts] = useState([]);

  useEffect(() => {
    fetchExamplePrompts().then(setPrompts);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {prompts.map(({ id, prompt, taskType }) => (
        <ExamplePromptCard
          key={id}
          prompt={prompt}
          taskType={taskType}
          onClick={() => onPromptSelect(prompt)}
        />
      ))}
    </div>
  );
}
