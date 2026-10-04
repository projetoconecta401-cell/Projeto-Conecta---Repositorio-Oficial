import { useState, useEffect } from "react";
import { BottomNav } from "./components/BottomNav.jsx";
import { Toast } from "./components/ui.jsx";
import { INITIAL_JOBS, PROFESSIONALS, SOCIAL_MOCK } from "./data/mock.js";
import { conversaDireta, listarConversasDiretas, mesclarMensagens, novaMensagem, salvarMensagem } from "./lib/mensagens.js";
import { supabase } from "./lib/supabase.js";
import { getAutorId, listarVagas, publicarVaga, validarFormulario, vagaParaJob } from "./lib/vagas.js";
import { AccountScreen } from "./screens/account/AccountScreen.jsx";
import { EditProfileScreen } from "./screens/account/EditProfileScreen.jsx";
import { MyApplicationsScreen } from "./screens/account/MyApplicationsScreen.jsx";
import { MyDiariasScreen } from "./screens/account/MyDiariasScreen.jsx";
import { MyWorkHistoryScreen } from "./screens/account/MyWorkHistoryScreen.jsx";
import { AgendaScreen } from "./screens/AgendaScreen.jsx";
import { CadastroScreen } from "./screens/auth/CadastroScreen.jsx";
import { DocumentSelection } from "./screens/auth/DocumentSelection.jsx";
import { ForgotPasswordScreen } from "./screens/auth/ForgotPasswordScreen.jsx";
import { LoginScreen } from "./screens/auth/LoginScreen.jsx";
import { MiniResume } from "./screens/auth/MiniResume.jsx";
import { OnboardingProfile } from "./screens/auth/OnboardingProfile.jsx";
import { SecurityVerification } from "./screens/auth/SecurityVerification.jsx";
import { TermsScreen } from "./screens/auth/TermsScreen.jsx";
import { ChatListScreen } from "./screens/chat/ChatListScreen.jsx";
import { ChatScreen } from "./screens/chat/ChatScreen.jsx";
import { ConversationChatScreen } from "./screens/chat/ConversationChatScreen.jsx";
import { ProfessionalProfileScreen } from "./screens/chat/ProfessionalProfileScreen.jsx";
import { FeedScreen } from "./screens/FeedScreen.jsx";
import { JobDetail } from "./screens/JobDetail.jsx";
import { MapScreen } from "./screens/MapScreen.jsx";
import { NotificationsScreen } from "./screens/NotificationsScreen.jsx";
import { OfficializedScreen } from "./screens/OfficializedScreen.jsx";
import { PostJobSummaryScreen } from "./screens/PostJobSummaryScreen.jsx";
import { RatingScreen } from "./screens/RatingScreen.jsx";

/* ------------------------------------------------------------------ */
/*  APP ROOT                                                           */
/* ------------------------------------------------------------------ */

function App() {
  const [authStep, setAuthStep] = useState("login");
  const [socialProvider, setSocialProvider] = useState(null);
  const [screen, setScreen] = useState("feed");
  const [jobDetailReturnScreen, setJobDetailReturnScreen] = useState("feed");
  const [mode, setMode] = useState("trabalhar");
  const deriveApplicationStatus = (status) => {
    if (status === "Em Negociação") return "Em análise";
    if (status === "Em Atendimento") return "Candidatura oficializada";
    return null;
  };

  const [jobs, setJobs] = useState(() =>
    INITIAL_JOBS.map((j) => ({
      ...j,
      applicationStatus: deriveApplicationStatus(j.status),
      checkInAt: null,
      checkOutAt: null,
      cancelledBy: null,
      companyRating: 4.8,
      companyRatingCount: 24 + (j.id % 20),
    }))
  );
  const [activeJob, setActiveJob] = useState(null);
  const [notifications, setNotifications] = useState([
    { title: "Novo candidato!", body: "Alguém se candidatou para 'Pedreiro para reforma de varanda'.", read: false },
  ]);
  const [toast, setToast] = useState(null);
  const [savedJobIds, setSavedJobIds] = useState([]);
  const [profile, setProfile] = useState({
    name: "Você",
    email: "",
    phone: "",
    city: "Ji-Paraná, RO",
    bio: "",
    hasPhoto: false,
    competencies: [],
  });
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [conversations, setConversations] = useState([
    {
      id: "prof-1",
      professionalId: 1,
      name: "Fernanda Lima",
      avatar: "FL",
      unread: 2,
      lastMessage: "Consigo sim! Que horas seria o evento?",
      lastTime: new Date(Date.now() - 1000 * 60 * 35),
      messages: [
        { from: "them", text: "Olá! Vi que você tem uma vaga de recepção, ainda está disponível?" },
        { from: "me", text: "Oi Fernanda! Sim, ainda está aberta." },
        { from: "them", text: "Consigo sim! Que horas seria o evento?" },
      ],
    },
  ]);

  const pushToast = (t) => {
    setToast(t);
    setNotifications((n) => [{ ...t, read: false }, ...n]);
    setTimeout(() => setToast(null), 3500);
  };

  const handleToggleSaveJob = (id) => {
    setSavedJobIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  };

  const handleOpenNotifications = () => {
    setScreen("notifs");
  };

  const updateJob = (id, patch) => setJobs((js) => js.map((j) => (j.id === id ? { ...j, ...patch } : j)));

  // Campos de controle do ciclo da diária (em memória) para vagas vindas do banco.
  const withAppFields = (job) => ({
    ...job,
    applicationStatus: deriveApplicationStatus(job.status),
    checkInAt: null,
    checkOutAt: null,
    cancelledBy: null,
    companyRating: 4.8,
    companyRatingCount: 24,
  });

  // Mural dinâmico: carrega as vagas publicadas no Supabase (as de exemplo continuam abaixo).
  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    listarVagas()
      .then((vagas) => {
        if (cancelled) return;
        setJobs((js) => [...vagas.filter((v) => !js.some((j) => j.id === v.id)).map(withAppFields), ...js]);
      })
      .catch((err) => {
        if (!cancelled) pushToast({ title: "Vagas indisponíveis", body: err.message });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Chat direto: recupera as conversas salvas deste navegador (inclusive as iniciadas em outra visita).
  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    listarConversasDiretas()
      .then((porConversa) => {
        if (cancelled) return;
        setConversations((cs) => {
          let next = cs.map((c) => (porConversa[c.id] ? { ...c, messages: mesclarMensagens(c.messages, porConversa[c.id]) } : c));
          for (const [id, msgs] of Object.entries(porConversa)) {
            if (next.some((c) => c.id === id)) continue;
            const prof = PROFESSIONALS.find((p) => `prof-${p.id}` === id);
            if (!prof) continue;
            next = [{ id, professionalId: prof.id, name: prof.name, avatar: prof.avatar, unread: 0, messages: msgs }, ...next];
          }
          return next.map((c) => {
            const salvas = porConversa[c.id];
            if (!salvas?.length) return c;
            const ultima = salvas[salvas.length - 1];
            const ultimaData = new Date(ultima.createdAt);
            return !c.lastTime || ultimaData > c.lastTime ? { ...c, lastMessage: ultima.text, lastTime: ultimaData } : c;
          });
        });
      })
      .catch((err) => !cancelled && pushToast({ title: "Conversas indisponíveis", body: err.message }));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (screen === "notifs") {
      setNotifications((n) => (n.some((item) => !item.read) ? n.map((item) => ({ ...item, read: true })) : n));
    }
  }, [screen]);

  const handleApply = (job) => {
    updateJob(job.id, { status: "Em Negociação", candidate: "Você", applicationStatus: "Em análise" });
    pushToast({ title: "Candidatura enviada!", body: `${job.contractor} foi notificado da sua candidatura.` });
    setActiveJob({ ...job, status: "Em Negociação", candidate: "Você", applicationStatus: "Em análise" });
  };

  const handleAccept = (job) => {
    const updated = { ...job, status: "Em Atendimento", applicationStatus: "Candidatura oficializada" };
    updateJob(job.id, { status: "Em Atendimento", applicationStatus: "Candidatura oficializada" });
    pushToast({ title: "Candidato aceito ✅", body: `A vaga "${job.title}" saiu do mural público.` });
    setActiveJob(updated);
    setScreen("officialized");
  };

  const handleConfirmParticipation = (job) => {
    const hasConflict = jobs.some(
      (j) =>
        j.id !== job.id &&
        j.candidate === "Você" &&
        ["Diária agendada", "Em andamento"].includes(j.applicationStatus) &&
        j.dateISO &&
        job.dateISO &&
        j.dateISO === job.dateISO
    );
    if (hasConflict) {
      pushToast({ title: "Conflito de horário", body: "Você já possui uma diária confirmada neste dia." });
      return;
    }
    updateJob(job.id, { applicationStatus: "Diária agendada" });
    pushToast({ title: "Diária confirmada! ✅", body: "A empresa foi avisada que você confirmou." });
    setActiveJob({ ...job, applicationStatus: "Diária agendada" });
    setScreen("jobDetail");
  };

  const handleCheckIn = (job) => {
    const now = new Date();
    updateJob(job.id, { applicationStatus: "Em andamento", checkInAt: now });
    pushToast({ title: "Check-in registrado", body: `Horário: ${now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}` });
    setActiveJob({ ...job, applicationStatus: "Em andamento", checkInAt: now });
  };

  const handleCheckOut = (job) => {
    const now = new Date();
    updateJob(job.id, { applicationStatus: "Diária concluída", checkOutAt: now });
    pushToast({ title: "🔔 Diária concluída", body: "Avalie sua experiência com a empresa." });
    setActiveJob({ ...job, applicationStatus: "Diária concluída", checkOutAt: now });
    setScreen("rating");
  };

  const handleReopen = (job, cancelledBy = "profissional", reason = "") => {
    updateJob(job.id, { status: "Disponível", candidate: null, applicationStatus: "Cancelada", cancelledBy, cancelReason: reason });
    pushToast({
      title: "Vaga reaberta",
      body: cancelledBy === "empresa" ? `"${job.title}" foi cancelada pela empresa.` : `"${job.title}" voltou a ficar disponível no mural.`,
    });
    setScreen("feed");
    setActiveJob(null);
  };

  const handleComplete = (job) => {
    setActiveJob(job);
    setScreen("rating");
  };

  const handleRatingSubmit = (ratingData) => {
    updateJob(activeJob.id, {
      status: "Concluída",
      applicationStatus: "Finalizada",
      rating: ratingData,
    });
    pushToast({ title: "Avaliação enviada!", body: "Obrigado por avaliar a empresa." });
    setScreen("postJobSummary");
  };

  // Publica no Supabase (todos passam a ver a vaga). Sem Supabase configurado, cria só em memória.
  // Lança erro com mensagem amigável: o formulário mostra o erro e continua aberto.
  const handlePublish = async (formData) => {
    let newJob;
    if (supabase) {
      newJob = await publicarVaga(formData);
    } else {
      const { dados, erro } = validarFormulario(formData);
      if (erro) throw new Error(erro);
      newJob = vagaParaJob({ ...dados, id: Date.now(), autor_id: getAutorId(), status: "Disponível" });
    }
    setJobs((js) => [withAppFields(newJob), ...js]);
    pushToast({ title: "Vaga publicada!", body: "Prestadores próximos serão notificados." });
  };

  const ACTIVE_APPLICATION_STATUSES = [
    "Em análise", "Candidatura oficializada", "Diária agendada", "Em andamento", "Diária concluída",
  ];

  const handleDeleteJob = (job) => {
    const id = typeof job === "object" ? job.id : job;
    const target = typeof job === "object" ? job : jobs.find((j) => j.id === id);
    const hasActiveCandidate =
      target && target.candidate && ACTIVE_APPLICATION_STATUSES.includes(target.applicationStatus);
    if (hasActiveCandidate) {
      pushToast({
        title: "Não é possível excluir",
        body: "Esta vaga tem uma candidatura em andamento. Cancele a negociação com o profissional antes de excluir.",
      });
      return;
    }
    setJobs((js) => js.filter((j) => j.id !== id));
    pushToast({ title: "Vaga excluída", body: "A vaga foi removida do seu painel e do mural." });
  };

  const handleOpenProfile = (professional) => {
    setSelectedProfessional(professional);
    setScreen("professionalProfile");
  };

  const handleOpenConversation = (conv) => {
    setConversations((cs) => cs.map((c) => (c.id === conv.id ? { ...c, unread: 0 } : c)));
    setActiveConversationId(conv.id);
    setScreen("conversationChat");
  };

  const handleStartOrOpenConversation = (professional) => {
    const existing = conversations.find((c) => c.professionalId === professional.id);
    if (existing) {
      handleOpenConversation(existing);
      return;
    }
    const newConv = {
      id: `prof-${professional.id}`,
      professionalId: professional.id,
      name: professional.name,
      avatar: professional.avatar,
      unread: 0,
      lastMessage: "Conversa iniciada",
      lastTime: new Date(),
      messages: [],
    };
    setConversations((cs) => [newConv, ...cs]);
    setActiveConversationId(newConv.id);
    setScreen("conversationChat");
  };

  const handleSendConversationMessage = (conversationId, content) => {
    const isAudio = typeof content === "object" && content !== null;
    const msgId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    // Texto: id estável (mesmo na tela e no banco) e salvo no Supabase. Áudio: só na tela.
    const messagePart = isAudio
      ? { id: msgId, from: "me", type: "audio", audioUrl: content.audioUrl, duration: content.duration }
      : novaMensagem(content);
    if (!isAudio) {
      salvarMensagem(conversaDireta(conversationId), messagePart).catch((err) =>
        pushToast({ title: "Mensagem não salva", body: err.message })
      );
    }
    const lastMessagePreview = isAudio ? "🎤 Mensagem de voz" : content;
    setConversations((cs) =>
      cs.map((c) =>
        c.id === conversationId
          ? { ...c, messages: [...c.messages, messagePart], lastMessage: lastMessagePreview, lastTime: new Date() }
          : c
      )
    );
  };

  /* ---- AUTH FLOW ---- */
  if (authStep !== "done") {
    const steps = {
      login: (
        <LoginScreen
          onLogin={() => setAuthStep("done")}
          goCadastro={() => setAuthStep("cadastro")}
          goForgot={() => setAuthStep("forgotPassword")}
          goSocial={(provider) => {
            setSocialProvider(provider);
            setAuthStep("cadastro");
          }}
        />
      ),
      forgotPassword: <ForgotPasswordScreen onBack={() => setAuthStep("login")} />,
      cadastro: (
        <CadastroScreen
          onBack={() => {
            setSocialProvider(null);
            setAuthStep("login");
          }}
          onNext={() => setAuthStep("onboarding")}
          socialProvider={socialProvider}
          socialPrefill={socialProvider ? SOCIAL_MOCK[socialProvider] : null}
        />
      ),
      onboarding: (
        <OnboardingProfile
          onSelect={(m) => {
            setMode(m);
            setAuthStep("document");
          }}
        />
      ),
      document: <DocumentSelection onBack={() => setAuthStep("onboarding")} onNext={() => setAuthStep("security")} />,
      security: <SecurityVerification onBack={() => setAuthStep("document")} onNext={() => setAuthStep("resume")} />,
      resume: (
        <MiniResume
          onBack={() => setAuthStep("security")}
          onSkip={() => setAuthStep("terms")}
          onNext={() => setAuthStep("terms")}
        />
      ),
      terms: <TermsScreen onBack={() => setAuthStep("resume")} onFinish={() => setAuthStep("done")} />,
    };
    return (
      <div className="w-full max-w-sm mx-auto h-[820px] max-h-[92vh] bg-slate-50 rounded-[2rem] overflow-hidden shadow-2xl border border-slate-200 flex flex-col relative font-sans">
        {steps[authStep]}
      </div>
    );
  }

  /* ---- MAIN APP ---- */
  let content;
  const unreadNotifications = notifications.filter((n) => !n.read).length;

  if (screen === "feed")
    content = (
      <FeedScreen
        mode={mode}
        jobs={jobs}
        onOpenJob={(j) => { setActiveJob(j); setJobDetailReturnScreen("feed"); setScreen("jobDetail"); }}
        onPublish={handlePublish}
        onDeleteJob={handleDeleteJob}
        onOpenProfile={handleOpenProfile}
        savedJobIds={savedJobIds}
        onToggleSave={handleToggleSaveJob}
        unreadNotifications={unreadNotifications}
        onOpenNotifications={handleOpenNotifications}
        onViewProfile={() => setScreen("account")}
        onLogout={() => { setScreen("feed"); setAuthStep("login"); }}
        profile={profile}
      />
    );
  else if (screen === "jobDetail")
    content = (
      <JobDetail
        job={jobs.find((j) => j.id === activeJob.id) || activeJob}
        onBack={() => setScreen(jobDetailReturnScreen)}
        onApply={handleApply}
        onAccept={handleAccept}
        onReopen={handleReopen}
        onGoChat={(j) => { setActiveJob(j); setScreen("chat"); }}
        onCheckIn={handleCheckIn}
        onCheckOut={handleCheckOut}
      />
    );
  else if (screen === "map")
    content = (
      <MapScreen
        jobs={jobs}
        pushToast={pushToast}
        onOpenJob={(j) => { setActiveJob(j); setJobDetailReturnScreen("map"); setScreen("jobDetail"); }}
      />
    );
  else if (screen === "agenda") content = <AgendaScreen jobs={jobs} onOpenJob={(j) => { setActiveJob(j); setJobDetailReturnScreen("agenda"); setScreen("jobDetail"); }} />;
  else if (screen === "notifs") content = <NotificationsScreen notifications={notifications} />;
  else if (screen === "account")
    content = (
      <AccountScreen
        mode={mode}
        setMode={setMode}
        onBack={() => setScreen("feed")}
        onDelete={() => setAuthStep("login")}
        onLogout={() => { setScreen("feed"); setAuthStep("login"); }}
        onOpenHistory={() => setScreen("workHistory")}
        onOpenApplications={() => setScreen("myApplications")}
        onOpenDiarias={() => setScreen("myDiarias")}
        profile={profile}
        onEditProfile={() => setScreen("editProfile")}
      />
    );
  else if (screen === "editProfile")
    content = (
      <EditProfileScreen
        mode={mode}
        profile={profile}
        onSave={(updated) => setProfile(updated)}
        onBack={() => setScreen("account")}
      />
    );
  else if (screen === "workHistory")
    content = <MyWorkHistoryScreen onBack={() => setScreen("account")} />;
  else if (screen === "myApplications")
    content = (
      <MyApplicationsScreen
        jobs={jobs}
        onBack={() => setScreen("account")}
        onOpenJob={(j) => { setActiveJob(j); setJobDetailReturnScreen("myApplications"); setScreen("jobDetail"); }}
      />
    );
  else if (screen === "myDiarias")
    content = (
      <MyDiariasScreen
        jobs={jobs}
        onBack={() => setScreen("account")}
        onOpenJob={(j) => { setActiveJob(j); setJobDetailReturnScreen("myDiarias"); setScreen("jobDetail"); }}
      />
    );
  else if (screen === "chat")
    content = (
      <ChatScreen
        job={jobs.find((j) => j.id === activeJob.id) || activeJob}
        onBack={() => setScreen("jobDetail")}
        onComplete={handleComplete}
        onCancel={handleReopen}
      />
    );
  else if (screen === "rating") content = <RatingScreen job={activeJob} onBack={() => setScreen("jobDetail")} onSubmit={handleRatingSubmit} />;
  else if (screen === "officialized")
    content = <OfficializedScreen job={activeJob} onBack={() => setScreen("jobDetail")} onConfirm={handleConfirmParticipation} />;
  else if (screen === "postJobSummary")
    content = <PostJobSummaryScreen jobs={jobs} onDone={() => { setScreen("feed"); setActiveJob(null); }} />;
  else if (screen === "professionalProfile")
    content = (
      <ProfessionalProfileScreen
        professional={selectedProfessional}
        onBack={() => setScreen("feed")}
        onMessage={handleStartOrOpenConversation}
      />
    );
  else if (screen === "chatList")
    content = <ChatListScreen conversations={conversations} onOpenConversation={handleOpenConversation} />;
  else if (screen === "conversationChat") {
    const activeConversation = conversations.find((c) => c.id === activeConversationId);
    content = activeConversation ? (
      <ConversationChatScreen
        conversation={activeConversation}
        onBack={() => setScreen("chatList")}
        onSend={handleSendConversationMessage}
      />
    ) : null;
  }

  const showNav = ["feed", "map", "agenda", "notifs", "account", "chatList"].includes(screen);
  const unreadConversations = conversations.filter((c) => c.unread > 0).length;

  return (
    <div className="w-full max-w-sm mx-auto h-[820px] max-h-[92vh] bg-slate-50 rounded-[2rem] overflow-hidden shadow-2xl border border-slate-200 flex flex-col relative font-sans">
      <style>{`
        .no-scrollbar::-webkit-scrollbar{display:none}
        .no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}
        @keyframes fadeIn{from{opacity:0;transform:translate(-50%,-8px)}to{opacity:1;transform:translate(-50%,0)}}
      `}</style>
      <Toast toast={toast} />
      <div className="flex-1 overflow-y-auto no-scrollbar">{content}</div>
      {showNav && <BottomNav active={screen} setScreen={setScreen} mode={mode} unreadConversations={unreadConversations} />}
    </div>
  );
}

export default App;
