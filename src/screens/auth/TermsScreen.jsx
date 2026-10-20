import { Screen, TopBar, PrimaryButton } from "../../components/ui.jsx";
import { TextoTermoLgpd } from "../../components/TermoLgpd.jsx";

/* Termos de Uso, Política de Privacidade e Termo de Consentimento (LGPD) — leitura; o aceite fica no cadastro. */
export function TermsScreen({ onBack }) {
  return (
    <Screen>
      <TopBar title="Termos e Privacidade" onBack={onBack} />
      <div className="flex-1 w-full max-w-md mx-auto px-6 py-6 text-[13px] text-slate-600 leading-relaxed space-y-4">
        <section>
          <h2 className="font-bold text-slate-800 mb-1.5">Termos de Uso</h2>
          <p>
            O EiFreela aproxima quem precisa contratar uma diária ou serviço de profissionais disponíveis. Contratantes e
            profissionais combinam valores, horários e local diretamente pelo chat do app e se avaliam mutuamente ao fim de
            cada diária. Use o chat com respeito e não publique endereços exatos nas vagas.
          </p>
        </section>
        <section>
          <h2 className="font-bold text-slate-800 mb-1.5">Política de Privacidade (LGPD)</h2>
          <p>
            Guardamos somente os dados do seu cadastro: nome completo, CPF, e-mail, data de nascimento, telefone/WhatsApp,
            foto e áreas de atuação. CPF, e-mail, nascimento e telefone ficam visíveis apenas para você. O EiFreela não
            pede nem armazena dados bancários. As vagas mostram só a região aproximada. Você pode excluir sua conta e
            todos os seus dados a qualquer momento em Perfil → Excluir conta (Lei nº 13.709/2018).
          </p>
        </section>
        <section className="border-t border-slate-200 pt-4">
          <TextoTermoLgpd />
        </section>
        <PrimaryButton onClick={onBack}>Entendi</PrimaryButton>
      </div>
    </Screen>
  );
}
