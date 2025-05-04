import { ChatLayout } from "./_components/chat-layout";

type Params = Promise<{ id: string }>;

export default async function ChatPage({ params }: { params: Params }) {
  const { id } = await params;

  return (
    <div className="flex flex-col h-[100vh] w-full">
      <ChatLayout id={id} />
    </div>
  );
}
