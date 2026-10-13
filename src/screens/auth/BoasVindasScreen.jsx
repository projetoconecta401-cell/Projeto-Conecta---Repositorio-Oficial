import {
  Bell, Briefcase, Calendar, CalendarCheck, Clock, HandHelping, IdCard, Lock, LogIn, Mail, MapPin, MessageCircle,
  Mic, Navigation, Phone, ShieldCheck, Smartphone, Star, UserPlus, Users, Utensils, PartyPopper, Hammer, Camera, Cake, User,
} from "lucide-react";
import { GuiaInstalacao } from "../../components/GuiaInstalacao.jsx";

/*
 * Primeira tela de quem ainda não entrou: explica para que serve o EiFreela, mostra
 * exemplos (ilustrativos, não são vagas reais), o que é pedido no cadastro e como
 * instalar no celular. Daqui a pessoa vai para "Criar conta" ou "Entrar".
 */

const EXEMPLOS = [
  { icon: PartyPopper, cat: "Eventos", titulo: "Garçom para festa de casamento", quem: "Buffet Sabor & Arte", quando: "Sáb · 18h às 23h", onde: "A 2 km · Centro", valor: "R$ 180" },
  { icon: Utensils, cat: "Gastronomia", titulo: "Auxiliar de cozinha (almoço)", quem: "Restaurante da Praça", quando: "Amanhã · 10h às 15h", onde: "A 4 km · Jardim América", valor: "R$ 120" },
  { icon: Hammer, cat: "Manutenção/Obras", titulo: "Pintura de muro (30 m²)", quem: "Carla M.", quando: "Seg · Horário a combinar", onde: "Próximo a você", valor: "R$ 450" },
];

const RECURSOS = [
  { icon: MapPin, titulo: "Mapa de vagas", texto: "Veja as vagas no raio que você escolher." },
  { icon: Calendar, titulo: "Agenda", texto: "Suas diárias organizadas por data." },
  { icon: Mic, titulo: "Chat com áudio", texto: "Combine tudo por texto ou mensagem de voz." },
  { icon: Bell, titulo: "Avisos de vagas", texto: "Notificação quando sair vaga na sua área." },
  { icon: CalendarCheck, titulo: "Check-in e check-out", texto: "Registre a entrada e a saída da diária." },
  { icon: Star, titulo: "Avaliações", texto: "Notas e comentários dos dois lados." },
];

const DADOS = [
  { icon: User, texto: "Nome completo" },
  { icon: IdCard, texto: "CPF (uma conta por pessoa)" },
  { icon: Mail, texto: "E-mail (confirmado por código)" },
  { icon: Cake, texto: "Data de nascimento (18+)" },
  { icon: Phone, texto: "Telefone / WhatsApp" },
  { icon: Camera, texto: "Foto de perfil" },
  { icon: Briefcase, texto: "Áreas em que você trabalha" },
  { icon: Lock, texto: "Senha com letras, números e símbolo" },
];

export function BoasVindasScreen({ goCadastro, goLogin }) {
  return (
    <div className="min-h-[100dvh] bg-slate-50">
      {/* Barra do topo */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-100 pt-[env(safe-area-inset-top)]">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-2.5">
          <img src="/icons/icon-192.png" alt="" width="32" height="32" className="w-8 h-8 rounded-lg" />
          <span className="font-extrabold text-[17px] text-slate-800 tracking-tight flex-1">
            Ei<span className="text-emerald-600">Freela</span>
          </span>
          <button onClick={goLogin} className="flex items-center gap-1.5 px-3.5 h-9 rounded-full border border-emerald-200 text-emerald-700 text-[13px] font-bold">
            <LogIn size={15} /> Entrar
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 pb-[calc(2.5rem+env(safe-area-inset-bottom))] flex flex-col gap-10">
        {/* Apresentação */}
        <section className="pt-8 flex flex-col gap-4">
          <span className="self-start px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[12px] font-bold">Grátis · Diárias e freelas</span>
          <h1 className="text-[28px] leading-tight font-extrabold text-slate-800 tracking-tight">
            A mão extra que você precisa, <span className="text-emerald-600">perto de você.</span>
          </h1>
          <p className="text-[15px] text-slate-600 leading-relaxed">
            O EiFreela liga quem precisa de alguém para uma diária ou um serviço avulso a profissionais da sua região. Publique uma vaga
            ou encontre trabalho, converse pelo chat, combine os detalhes e avalie no final. Tudo pelo celular.
          </p>
          <div className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-2.5 pt-1">
            <button onClick={goCadastro} className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold text-[15px] shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition">
              <UserPlus size={18} /> Criar minha conta
            </button>
            <button onClick={goLogin} className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-[15px] active:scale-[0.98] transition">
              <LogIn size={18} /> Já tenho conta
            </button>
          </div>
        </section>

        {/* Para quem é */}
        <Secao titulo="Para que serve">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Publico
              icon={Briefcase}
              titulo="Quem precisa contratar"
              itens={[
                "Publique a vaga com data, horário, valor e bairro",
                "Receba candidatos e veja foto, áreas e avaliações",
                "Escolha o profissional e combine tudo pelo chat",
              ]}
            />
            <Publico
              icon={HandHelping}
              titulo="Quem quer trabalhar"
              itens={[
                "Encontre diárias por categoria, valor, data e distância",
                "Candidate-se com um toque e converse com o contratante",
                "Ganhe avaliações e mostre sua nota para novos clientes",
              ]}
            />
          </div>
        </Secao>

        {/* Como funciona */}
        <Secao titulo="Como funciona">
          <ol className="flex flex-col gap-3">
            {[
              ["Crie sua conta", "Leva uns 2 minutos. O e-mail é confirmado com um código."],
              ["Publique ou candidate-se", "Contratantes publicam a vaga; profissionais se candidatam."],
              ["Combine pelo chat", "Texto ou áudio. O endereço exato só é passado pelo chat."],
              ["Faça a diária e avalie", "Check-in, check-out e avaliação dos dois lados no final."],
            ].map(([t, x], i) => (
              <li key={t} className="flex items-start gap-3 p-3.5 bg-white rounded-2xl border border-slate-100">
                <span className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-[14px] flex items-center justify-center shrink-0">{i + 1}</span>
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 text-[14.5px]">{t}</p>
                  <p className="text-[13px] text-slate-500 leading-snug">{x}</p>
                </div>
              </li>
            ))}
          </ol>
        </Secao>

        {/* Exemplos */}
        <Secao titulo="Veja como aparece" aviso="Exemplos ilustrativos">
          <p className="text-[13px] text-slate-500 -mt-1">Assim ficam as vagas no mural:</p>
          <div className="-mx-5 px-5 flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 [scrollbar-width:none]">
            {EXEMPLOS.map((v) => (
              <ExemploVaga key={v.titulo} v={v} />
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
            <div className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-col gap-2">
              <p className="text-[12px] font-bold text-slate-500 flex items-center gap-1.5"><MessageCircle size={14} /> Chat da vaga</p>
              <Balao>Oi! Tenho experiência com eventos. Posso chegar às 17h30?</Balao>
              <Balao meu>Pode sim! Traje social, por favor.</Balao>
              <div className="self-start flex items-center gap-2 px-3 py-2 rounded-2xl rounded-bl-md bg-slate-100 text-slate-600 text-[12px]">
                <Mic size={14} className="text-emerald-600" /> <span className="h-1 w-20 rounded-full bg-slate-300" /> 0:12
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-col gap-2">
              <p className="text-[12px] font-bold text-slate-500 flex items-center gap-1.5"><Star size={14} /> Avaliação</p>
              <div className="flex items-center gap-2.5">
                <span className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 font-bold text-[14px] flex items-center justify-center shrink-0">JP</span>
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 text-[14px] truncate">João P.</p>
                  <p className="flex text-amber-400" aria-label="5 estrelas">
                    {[1, 2, 3, 4, 5].map((n) => <Star key={n} size={14} fill="currentColor" />)}
                  </p>
                </div>
              </div>
              <p className="text-[13px] text-slate-600 italic leading-snug">“Chegou no horário, muito educado e caprichoso. Contrataria de novo!”</p>
            </div>
          </div>
        </Secao>

        {/* Recursos */}
        <Secao titulo="O que tem no app">
          <div className="grid grid-cols-2 gap-3">
            {RECURSOS.map(({ icon: Icon, titulo, texto }) => (
              <div key={titulo} className="bg-white rounded-2xl border border-slate-100 p-3.5 flex flex-col gap-1.5 min-w-0">
                <span className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><Icon size={18} /></span>
                <p className="font-bold text-slate-800 text-[13.5px] leading-tight">{titulo}</p>
                <p className="text-[12px] text-slate-500 leading-snug">{texto}</p>
              </div>
            ))}
          </div>
        </Secao>

        {/* Cadastro e dados */}
        <Secao titulo="O que você precisa para se cadastrar">
          <ul className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-x-4 gap-y-2.5 bg-white rounded-2xl border border-slate-100 p-4">
            {DADOS.map(({ icon: Icon, texto }) => (
              <li key={texto} className="flex items-center gap-2.5 text-[13.5px] text-slate-700 min-w-0">
                <Icon size={16} className="text-emerald-600 shrink-0" /> <span className="min-w-0">{texto}</span>
              </li>
            ))}
          </ul>
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
            <ShieldCheck size={20} className="text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-[13px] text-emerald-900 leading-relaxed">
              <p><b>Seus dados protegidos.</b> Outros usuários veem só seu nome, foto, áreas e avaliações. CPF, e-mail, nascimento e telefone ficam visíveis apenas para você.</p>
              <p className="mt-1.5">O EiFreela <b>não pede dados bancários</b>, cartão ou PIX. Valor e pagamento são combinados direto entre as pessoas.</p>
              <p className="mt-1.5">As vagas mostram só a região aproximada; o endereço exato é combinado pelo chat.</p>
              <p className="mt-1.5">Você pode <b>denunciar e bloquear</b> qualquer pessoa, e o chat avisa quando uma mensagem parece golpe.</p>
            </div>
          </div>
          <p className="text-[12.5px] text-slate-500 flex items-start gap-2">
            <Users size={15} className="shrink-0 mt-px" /> Também dá para entrar com Google ou Facebook; depois você completa CPF, telefone e áreas.
          </p>
        </Secao>

        {/* Instalação */}
        <Secao titulo="Instale no seu celular" icone={Smartphone}>
          <p className="text-[13px] text-slate-500 -mt-1">É grátis, não precisa de loja de aplicativos e ocupa pouco espaço.</p>
          <GuiaInstalacao />
        </Secao>

        {/* Final */}
        <section className="flex flex-col gap-3 pt-2">
          <button onClick={goCadastro} className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold text-[15px] shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition">
            <UserPlus size={18} /> Criar minha conta grátis
          </button>
          <button onClick={goLogin} className="py-3 text-emerald-700 font-bold text-[14px]">Já tenho conta · Entrar</button>
          <p className="text-center text-[12px] text-slate-400 leading-relaxed">
            Uso exclusivo para maiores de 18 anos ·{" "}
            <a href="/termos/" target="_blank" rel="noopener" className="underline">Termos de Uso</a> ·{" "}
            <a href="/privacidade/" target="_blank" rel="noopener" className="underline">Privacidade</a>
          </p>
        </section>
      </main>
    </div>
  );
}

const Secao = ({ titulo, aviso, icone: Icone, children }) => (
  <section className="flex flex-col gap-3">
    <div className="flex items-center gap-2 flex-wrap">
      {Icone && <Icone size={20} className="text-emerald-600" />}
      <h2 className="text-[19px] font-extrabold text-slate-800 tracking-tight">{titulo}</h2>
      {aviso && <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">{aviso}</span>}
    </div>
    {children}
  </section>
);

const Publico = ({ icon: Icon, titulo, itens }) => (
  <div className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-col gap-3">
    <div className="flex items-center gap-2.5">
      <span className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0"><Icon size={20} /></span>
      <p className="font-bold text-slate-800 text-[15px]">{titulo}</p>
    </div>
    <ul className="flex flex-col gap-2">
      {itens.map((t) => (
        <li key={t} className="flex items-start gap-2 text-[13px] text-slate-600 leading-snug">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" /> {t}
        </li>
      ))}
    </ul>
  </div>
);

const ExemploVaga = ({ v }) => {
  const Icon = v.icon;
  return (
    <div className="snap-start shrink-0 w-[250px] bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col gap-2.5">
      <div className="flex items-center gap-2 min-w-0">
        <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0"><Icon size={16} /></span>
        <span className="text-[12px] font-bold text-slate-600 truncate">{v.cat}</span>
      </div>
      <div className="min-w-0">
        <p className="font-bold text-slate-800 text-[15px] leading-snug line-clamp-2">{v.titulo}</p>
        <p className="text-[12px] text-slate-500 truncate">{v.quem}</p>
      </div>
      <div className="flex flex-col gap-1 text-[12.5px] text-slate-500 border-t border-slate-100 pt-2.5">
        <span className="flex items-center gap-2 min-w-0"><Clock size={14} className="text-slate-400 shrink-0" /><span className="truncate">{v.quando}</span></span>
        <span className="flex items-center gap-2 min-w-0"><Navigation size={14} className="text-emerald-500 shrink-0" /><span className="truncate">{v.onde}</span></span>
      </div>
      <div>
        <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">Valor diária</span>
        <span className="text-[18px] font-extrabold text-emerald-700">{v.valor}</span>
      </div>
    </div>
  );
};

const Balao = ({ meu, children }) => (
  <p className={`max-w-[85%] px-3 py-2 text-[12.5px] leading-snug rounded-2xl ${meu ? "self-end bg-emerald-600 text-white rounded-br-md" : "self-start bg-slate-100 text-slate-700 rounded-bl-md"}`}>
    {children}
  </p>
);
