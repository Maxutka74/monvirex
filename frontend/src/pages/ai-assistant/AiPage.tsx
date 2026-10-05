import AIAssistantWidget from "../../widgets/ai-assistant/AIAssistantWidget.tsx";

const AiPage = () => {
  return (
    <section className="w-full pb-3 px-4 sm:px-6 lg:px-8 2xl:px-12">
      <div className="mx-auto max-w-[1700px]">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <AIAssistantWidget />
        </div>
      </div>
    </section>
  );
};

export default AiPage;
