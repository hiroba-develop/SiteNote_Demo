import { useEffect, useRef, useState } from "react";
import { useContractChange } from "../contexts/ContractChangeContext";
import { useProjects } from "../contexts/ProjectsContext";

// Web Speech API 型定義 (簡易)
type SpeechRecognitionType = any; // Fallback to 'any' for environments without proper types
interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionType;
}

declare global {
  interface Window {
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }
}

const getSpeechRecognition = (): SpeechRecognitionType | null => {
  const SpeechRecognition = (window as any).SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return null;
  return new SpeechRecognition();
};

const ContractChange = () => {
  const recognitionRef = useRef<SpeechRecognitionType | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [draftText, setDraftText] = useState("");
  const { drafts, addDraft } = useContractChange();
  const { projects } = useProjects();
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");

  useEffect(() => {
    const recognition = getSpeechRecognition();
    if (!recognition) return;

    recognition.lang = "ja-JP";
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const res = event.results[i];
        if (res.isFinal) {
          setTranscript((prev) => prev + res[0].transcript);
        } else {
          interim += res[0].transcript;
        }
      }
    };
    recognition.onerror = (e: any) => {
      console.error("Speech recognition error", e);
      setIsRecording(false);
    };
    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
  }, []);

  const handleRecordToggle = () => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      alert("このブラウザは音声入力に対応していません");
      return;
    }

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      setTranscript("");
      recognition.start();
      setIsRecording(true);
    }
  };

  const handleGenerateDraft = () => {
    const template = `【変更契約ドラフト】\n\n変更概要:\n${transcript}\n\n変更理由: \n金額変更: \n開始日: \n完了日: \n\nご確認ください。`;
    setDraftText(template);
  };

  const handleSaveDraft = () => {
    if (!draftText.trim() || !projectId) return;
    addDraft({ transcript, draftText, projectId });
    setTranscript("");
    setDraftText("");
    alert("ドラフトを保存しました");
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">契約変更 (音声入力デモ)</h1>

      {/* プロジェクト選択 */}
      <div className="mb-6">
        <label className="mr-2 text-sm">対象工事:</label>
        <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="border rounded p-2">
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-6">
        <div className="bg-white p-6 shadow rounded-lg">
          <h2 className="text-lg font-medium">1. 音声入力</h2>
          <p className="text-sm text-gray-500 mb-4">
            マイクを許可すると、変更内容を話して文字起こしできます。
          </p>
          <button
            onClick={handleRecordToggle}
            className={`px-4 py-2 rounded-md text-white ${isRecording ? "bg-red-600" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            {isRecording ? "録音停止" : "録音開始"}
          </button>
          <div className="mt-4 border rounded p-3 min-h-[80px] whitespace-pre-wrap">
            {transcript || "(ここに文字起こし結果が表示されます)"}
          </div>
        </div>

        <div className="bg-white p-6 shadow rounded-lg">
          <h2 className="text-lg font-medium">2. ドラフト生成</h2>
          <button
            onClick={handleGenerateDraft}
            disabled={!transcript}
            className="px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
          >
            ドラフト生成
          </button>
          <textarea
            className="mt-4 w-full border rounded p-3 h-56"
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
          />
          <button
            onClick={handleSaveDraft}
            disabled={!draftText.trim()}
            className="mt-3 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
          >
            保存
          </button>
        </div>

        <div className="bg-white p-6 shadow rounded-lg">
          <h2 className="text-lg font-medium mb-4">保存済みドラフト</h2>
          {drafts.filter((d) => d.projectId === projectId).length === 0 ? (
            <p className="text-sm text-gray-500">まだドラフトはありません。</p>
          ) : (
            <ul className="space-y-4">
              {drafts
                .filter((d) => d.projectId === projectId)
                .map((d) => (
                <li key={d.id} className="border rounded p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">
                      {new Date(d.createdAt).toLocaleString()}
                    </span>
                    {d.approved && (
                      <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 font-medium">
                        承認済
                      </span>
                    )}
                  </div>
                  <pre className="whitespace-pre-wrap text-sm text-gray-800">
                    {d.draftText}
                  </pre>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContractChange;
