import { useCallback, useEffect, useRef, useState } from "react";
import { BottomNav } from "./components/BottomNav.jsx";
import { Toast } from "./components/ui.jsx";
import { sair, excluirConta } from "./lib/auth.js";
import { enviarAvatarPendente } from "./lib/perfis.js";
import { listarConversas, candidatar, abrirConversaDireta } from "./lib/conversas.js";
import { iniciarPresenca } from "./lib/presenca.js";
import { carregarBloqueados } from "./lib/seguranca.js";
import { useBloqueados } from "./components/Seguranca.jsx";
import { BloqueadosScreen } from "./screens/account/BloqueadosScreen.jsx";
import { contarNaoLidas } from "./lib/notificacoes.js";
import { vagasJaAvaliadas } from "./lib/avaliacoes.js";
import { avisoDoSistema } from "./lib/push.js";
import { pedirPosicaoAproximada, posicaoSalva } from "./lib/geo.js";
import { supabase } from "./lib/supabase.js";
import {
  aceitarCandidato, cancelarContratacao, concluirVaga, desistirDaVaga, excluirVaga, listarVagas, publicarVaga, registrarPresenca,
} from "./lib/vagas.js";
import { AccountScreen } from "./screens/account/AccountScreen.jsx";
import { EditProfileScreen } from "./screens/account/EditProfileScreen.jsx";
import { MyApplicationsScreen } from "./screens/account/MyApplicationsScreen.jsx";
import { MyDiariasScreen } from "./screens/account/MyDiariasScreen.jsx";
import { MyWorkHistoryScreen } from "./screens/account/MyWorkHistoryScreen.jsx";
import { AgendaScreen } from "./screens/AgendaScreen.jsx";
import { OnboardingProfile } from "./screens/auth/OnboardingProfile.jsx";
import { ChatListScreen } from "./screens/chat/ChatListScreen.jsx";
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
/*  APP — tudo vem do Supabase (sem dados de exemplo).                 */
/*  O AuthGate recria o App a cada troca de conta.                     */
/* ------------------------------------------------------------------ */

const ABAS = ["feed", "map", "agenda", "notifs", "account", "chatList"];
const lerModo = () => {
  try {
    return localStorage.getItem("eifreela:modo");
  } catch {
    return null;
  }
};

function App({ session, perfil, onPerfilAlterado }) {
  const userId = session.user.id;
  const [modo, setModoEstado] = useState(lerModo);
  // Navegação com histórico: o "voltar" do celular volta de tela em vez de fechar o app.
  const [nav, setNav] = useState({ screen: "feed" });
  const { screen } = nav;
  const [jobs, setJobs] = useState([]);
  const [carregandoVagas, setCarregandoVagas] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [carregandoConversas, setCarregandoConversas] = useState(true);
  const [naoLidas, setNaoLidas] = useState(0);
  const [avaliadas, setAvaliadas] = useState(new Set());
  const [toast, setToast] = useState(null);
  const bloqueadosIds = useBloqueados();
  const [posicao, setPosicao] = useState(posicaoSalva);
  const [savedJobIds, setSavedJobIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(`eifreela:favoritas:${userId}`) || "[]");
    } catch {
      return [];
    }
  });
  const navRef = useRef(nav);
  navRef.current = nav;
  const timerToast = useRef(null);

  const profile = { ...perfil, name: perfil.nome };

  /* ---------------------------------------------------------- navegação -- */
  const go = useCallback((screen, extras = {}) => {
    const novo = { screen, ...extras };
    window.history.pushState(novo, "");
    setNav(novo);
    window.scrollTo(0, 0);
  }, []);
  const back = useCallback(() => window.history.back(), []);

  useEffect(() => {
    window.history.replaceState({ screen: "feed" }, "");
    const aoVoltar = (e) => {
      setNav(e.state?.screen ? e.state : { screen: "feed" });
      window.scrollTo(0, 0);
    };
    window.addEventListener("popstate", aoVoltar);
    return () => window.removeEventListener("popstate", aoVoltar);
  }, []);

  const pushToast = useCallback((t) => {
    setToast(t);
    clearTimeout(timerToast.current);
    timerToast.current = setTimeout(() => setToast(null), 4500);
  }, []);

  /* ------------------------------------------------------------ dados -- */
  const recarregarVagas = useCallback(async () => {
    try {
      setJobs(await listarVagas(userId));
    } catch (err) {
      pushToast({ title: "Vagas indisponíveis", body: err.message });
    } finally {
      setCarregandoVagas(false);
    }
  }, [userId, pushToast]);

  const recarregarConversas = useCallback(async () => {
    try {
      setConversations(await listarConversas(userId));
    } catch (err) {
      pushToast({ title: "Conversas indisponíveis", body: err.message });
    } finally {
      setCarregandoConversas(false);
    }
  }, [userId, pushToast]);

  const recarregarAvisos = useCallback(async () => setNaoLidas(await contarNaoLidas()), []);
  const recarregarAvaliadas = useCallback(async () => setAvaliadas(await vagasJaAvaliadas(userId)), [userId]);

  useEffect(() => {
    recarregarVagas();
    recarregarConversas();
    recarregarAvisos();
    recarregarAvaliadas();
    // Foto escolhida no cadastro: envia agora que a conta já está logada.
    enviarAvatarPendente(userId)
      .then((url) => url && onPerfilAlterado())
      .catch(() => pushToast({ title: "Foto não enviada", body: "Tente de novo em Perfil → Editar perfil." }));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // "Online agora" e "visto por último" (chat) + pessoas que eu bloqueei.
  useEffect(() => iniciarPresenca(userId), [userId]);
  useEffect(() => {
    carregarBloqueados();
  }, [userId]);

  // Tempo real: vagas, notificações e mensagens.
  useEffect(() => {
    let espera;
    let esperaConversas;
    const vagasDepois = () => {
      clearTimeout(espera);
      espera = setTimeout(recarregarVagas, 400);
    };
    const conversasDepois = () => {
      clearTimeout(esperaConversas);
      esperaConversas = setTimeout(recarregarConversas, 600);
    };
    const canal = supabase
      .channel(`app-${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "vagas" }, vagasDepois)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "conversas" }, () => {
        recarregarConversas();
        vagasDepois();
      })
      // Leitura da conversa pela outra pessoa (✓✓ na lista do chat).
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "conversas" }, conversasDepois)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notificacoes", filter: `usuario_id=eq.${userId}` }, ({ new: n }) => {
        setNaoLidas((x) => x + 1);
        pushToast({
          title: n.titulo,
          body: n.corpo,
          onClick: n.vaga_id ? () => go("jobDetail", { jobId: n.vaga_id }) : () => go("notifs"),
        });
        avisoDoSistema(n.titulo, n.corpo ?? "", "/app/");
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_mensagens" }, ({ new: m }) => {
        recarregarConversas();
        if (m.autor_id === userId) return;
        const atual = navRef.current;
        if (atual.screen === "conversationChat" && atual.conversaId === m.conversa_id) return;
        const texto = m.tipo === "audio" ? "🎤 Mensagem de voz" : m.texto;
        pushToast({ title: "💬 Nova mensagem", body: texto, onClick: () => go("conversationChat", { conversaId: m.conversa_id }) });
        avisoDoSistema("Nova mensagem no EiFreela", texto ?? "", "/app/");
      })
      .subscribe();
    return () => {
      clearTimeout(espera);
      clearTimeout(esperaConversas);
      supabase.removeChannel(canal);
    };
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (screen === "chatList") recarregarConversas();
    if (screen === "feed" || screen === "notifs") recarregarAvisos();
  }, [screen]); // eslint-disable-line react-hooks/exhaustive-deps

  /* --------------------------------------------------------- ações -- */
  const setMode = (m) => {
    setModoEstado(m);
    try {
      localStorage.setItem("eifreela:modo", m);
    } catch {
      /* ignorado */
    }
  };

  const handleToggleSaveJob = (id) => {
    setSavedJobIds((ids) => {
      const novo = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
      try {
        localStorage.setItem(`eifreela:favoritas:${userId}`, JSON.stringify(novo));
      } catch {
        /* ignorado */
      }
      return novo;
    });
  };

  const handlePedirPosicao = async () => {
    try {
      const p = await pedirPosicaoAproximada();
      setPosicao(p);
      pushToast({ title: "Localização aproximada ativada", body: "As vagas mostram a distância aproximada até você." });
      return p;
    } catch (err) {
      pushToast({ title: "Localização indisponível", body: err.message });
      return null;
    }
  };

  // Executa uma ação, mostra o erro em toast e recarrega as vagas.
  const executar = async (acao, sucesso) => {
    try {
      await acao();
      if (sucesso) pushToast(sucesso);
      await recarregarVagas();
      return true;
    } catch (err) {
      pushToast({ title: "Não foi possível concluir", body: err.message });
      return false;
    }
  };

  const handleApply = async (job) => {
    try {
      const conversaId = await candidatar(job, userId);
      pushToast({ title: "Candidatura enviada!", body: "O contratante foi avisado. Continue a conversa pelo chat." });
      recarregarVagas();
      recarregarConversas();
      go("conversationChat", { conversaId });
    } catch (err) {
      pushToast({ title: "Candidatura não enviada", body: err.message });
    }
  };

  const handleAccept = (job, freelancerId) =>
    executar(() => aceitarCandidato(job.id, freelancerId), {
      title: "Candidato aceito ✅",
      body: `"${job.title}" saiu do mural. O profissional foi avisado.`,
    });

  const handleCancelHire = (job) =>
    executar(() => cancelarContratacao(job.id), { title: "Contratação cancelada", body: "A vaga voltou para o mural." });

  const handleWithdraw = async (job, motivo) => {
    const ok = await executar(() => desistirDaVaga(job.id, motivo), { title: "Você desistiu da diária", body: "A vaga voltou para o mural." });
    if (ok) back();
  };

  const handleCheckIn = (job) =>
    executar(() => registrarPresenca(job.id, "entrada"), {
      title: "Check-in registrado",
      body: `Horário: ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`,
    });

  const handleCheckOut = async (job) => {
    const ok = await executar(() => registrarPresenca(job.id, "saida"), { title: "🔔 Diária concluída", body: "Avalie como foi com o contratante." });
    if (ok) go("rating", { jobId: job.id });
  };

  const handleComplete = async (job) => {
    const ok = await executar(() => concluirVaga(job.id), { title: "Diária concluída", body: "Avalie o profissional." });
    if (ok) go("rating", { jobId: job.id });
  };

  const handlePublish = async (formData) => {
    const job = await publicarVaga(formData, userId, { contratante: perfil.nome, posicao: formData.usarLocal ? posicao : null });
    setJobs((js) => [job, ...js.filter((j) => j.id !== job.id)]);
    pushToast({ title: "Vaga publicada!", body: "Quem atua nessa área foi avisado." });
  };

  const handleDeleteJob = async (job) => {
    if (["Em Negociação", "Em Atendimento"].includes(job.status) && job.contratadoId) {
      pushToast({ title: "Não é possível excluir", body: "Esta vaga tem um profissional contratado. Cancele a contratação antes de excluir." });
      return;
    }
    if (!window.confirm(`Excluir a vaga "${job.title}"? As conversas dela também serão apagadas.`)) return;
    const ok = await executar(() => excluirVaga(job.id), { title: "Vaga excluída", body: "A vaga foi removida do mural." });
    if (ok && screen === "jobDetail") back();
  };

  const handleMessageProfessional = async (prof) => {
    try {
      const conversaId = await abrirConversaDireta(userId, prof.id);
      recarregarConversas();
      go("conversationChat", { conversaId });
    } catch (err) {
      pushToast({ title: "Conversa não iniciada", body: err.message });
    }
  };

  const handleLogout = () => sair();
  const handleDeleteAccount = async () => {
    try {
      await excluirConta();
    } catch (err) {
      pushToast({ title: "Conta não excluída", body: err.message });
    }
  };

  /* ---------------------------------------------- escolha do modo -- */
  if (!modo) return <OnboardingProfile onSelect={setMode} />;

  /* ------------------------------------------------------- telas -- */
  const jobById = (id) => jobs.find((j) => j.id === id);
  // Vagas e conversas de quem eu bloqueei somem do mural, do mapa e do chat.
  const jobsVisiveis = jobs.filter((j) => j.isOwner || j.isHired || !bloqueadosIds.has(j.ownerId));
  const conversasVisiveis = conversations.filter((c) => !bloqueadosIds.has(c.outro?.id));
  const abrirVaga = (j) => go("jobDetail", { jobId: j.id });
  let content = null;

  if (screen === "feed")
    content = (
      <FeedScreen
        mode={modo}
        jobs={jobsVisiveis}
        loading={carregandoVagas}
        userId={userId}
        posicao={posicao}
        onPedirPosicao={handlePedirPosicao}
        onOpenJob={abrirVaga}
        onPublish={handlePublish}
        onDeleteJob={handleDeleteJob}
        onOpenProfile={(p) => go("professionalProfile", { profId: p.id })}
        savedJobIds={savedJobIds}
        onToggleSave={handleToggleSaveJob}
        unreadNotifications={naoLidas}
        onOpenNotifications={() => go("notifs")}
        onViewProfile={() => go("account")}
        onLogout={handleLogout}
        profile={profile}
      />
    );
  else if (screen === "jobDetail") {
    const job = jobById(nav.jobId);
    content = (
      <JobDetail
        job={job}
        loading={carregandoVagas}
        userId={userId}
        posicao={posicao}
        jaAvaliei={job ? avaliadas.has(job.id) : false}
        onBack={back}
        onApply={handleApply}
        onAccept={handleAccept}
        onCancelHire={handleCancelHire}
        onWithdraw={handleWithdraw}
        onCheckIn={handleCheckIn}
        onCheckOut={handleCheckOut}
        onComplete={handleComplete}
        onDelete={handleDeleteJob}
        onRate={(j) => go("rating", { jobId: j.id })}
        onOpenChat={(conversaId) => go("conversationChat", { conversaId })}
        onOpenProfile={(id) => go("professionalProfile", { profId: id })}
        onOfficialized={(j) => go("officialized", { jobId: j.id })}
        onAviso={pushToast}
      />
    );
  } else if (screen === "map")
    content = <MapScreen jobs={jobsVisiveis} posicao={posicao} onPedirPosicao={handlePedirPosicao} onOpenJob={abrirVaga} />;
  else if (screen === "agenda") content = <AgendaScreen jobs={jobs} onOpenJob={abrirVaga} />;
  else if (screen === "notifs")
    content = <NotificationsScreen userId={userId} onOpenJob={(id) => go("jobDetail", { jobId: id })} onChanged={recarregarAvisos} />;
  else if (screen === "account")
    content = (
      <AccountScreen
        mode={modo}
        setMode={setMode}
        onDelete={handleDeleteAccount}
        onLogout={handleLogout}
        onOpenHistory={() => go("workHistory")}
        onOpenApplications={() => go("myApplications")}
        onOpenDiarias={() => go("myDiarias")}
        onOpenBloqueados={() => go("bloqueados")}
        profile={profile}
        onEditProfile={() => go("editProfile")}
      />
    );
  else if (screen === "editProfile")
    content = (
      <EditProfileScreen
        profile={profile}
        onSaved={async () => {
          await onPerfilAlterado();
          pushToast({ title: "Perfil atualizado" });
          back();
        }}
        onBack={back}
      />
    );
  else if (screen === "workHistory") content = <MyWorkHistoryScreen jobs={jobs} userId={userId} onBack={back} onOpenJob={abrirVaga} />;
  else if (screen === "myApplications") content = <MyApplicationsScreen jobs={jobs} onBack={back} onOpenJob={abrirVaga} />;
  else if (screen === "myDiarias") content = <MyDiariasScreen jobs={jobs} onBack={back} onOpenJob={abrirVaga} />;
  else if (screen === "rating") {
    const job = jobById(nav.jobId);
    content = (
      <RatingScreen
        job={job}
        userId={userId}
        onBack={back}
        onSubmitted={async () => {
          await recarregarAvaliadas();
          pushToast({ title: "Avaliação enviada!", body: "Obrigado por avaliar." });
          if (job?.isHired) go("postJobSummary");
          else back();
        }}
      />
    );
  } else if (screen === "officialized")
    content = (
      <OfficializedScreen
        job={jobById(nav.jobId)}
        onBack={back}
        onOpenChat={(conversaId) => go("conversationChat", { conversaId })}
      />
    );
  else if (screen === "postJobSummary")
    content = <PostJobSummaryScreen jobs={jobs} userId={userId} onDone={() => go("feed")} />;
  else if (screen === "professionalProfile")
    content = (
      <ProfessionalProfileScreen profId={nav.profId} userId={userId} onBack={back} onMessage={handleMessageProfessional} onAviso={pushToast} />
    );
  else if (screen === "bloqueados")
    content = <BloqueadosScreen onBack={back} onAviso={pushToast} />;
  else if (screen === "chatList")
    content = (
      <ChatListScreen
        conversations={conversasVisiveis}
        loading={carregandoConversas}
        onOpenConversation={(c) => go("conversationChat", { conversaId: c.id })}
      />
    );
  else if (screen === "conversationChat")
    content = (
      <ConversationChatScreen
        key={nav.conversaId}
        conversaId={nav.conversaId}
        userId={userId}
        jobs={jobs}
        onBack={back}
        onRead={recarregarConversas}
        onOpenJob={abrirVaga}
        onOpenProfile={(id) => go("professionalProfile", { profId: id })}
        onAccept={handleAccept}
        onAviso={pushToast}
      />
    );

  const showNav = ABAS.includes(screen);
  const unreadConversations = conversasVisiveis.filter((c) => c.unread > 0).length;

  return (
    <div className={`w-full max-w-md md:max-w-3xl lg:max-w-5xl mx-auto min-h-[100dvh] bg-slate-50 font-sans relative ${showNav ? "pb-[calc(4.5rem+env(safe-area-inset-bottom))]" : ""}`}>
      <Toast toast={toast} onClose={() => setToast(null)} />
      {content}
      {showNav && (
        <BottomNav
          active={screen}
          setScreen={(s) => (s === screen ? window.scrollTo({ top: 0, behavior: "smooth" }) : go(s))}
          unreadConversations={unreadConversations}
          unreadNotifications={naoLidas}
        />
      )}
    </div>
  );
}

export default App;
