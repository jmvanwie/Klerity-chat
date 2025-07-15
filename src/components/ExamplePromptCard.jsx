// src/components/ExamplePromptCard.jsx
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ExamplePromptCard({ prompt, taskType, onClick }) {
  return (
    <Card className="rounded-2xl shadow hover:shadow-lg transition">
      <CardContent className="p-4 flex flex-col justify-between h-full">
        <h3 className="text-md font-semibold">{prompt}</h3>
        <p className="text-xs text-gray-500 mt-2 mb-4">Task: {taskType}</p>
        <Button onClick={onClick} size="sm">Try this prompt</Button>
      </CardContent>
    </Card>
  );
}
