import { Mail, User, MapPin, Check, Camera, Building2, ImagePlus, Phone } from "lucide-react";
import { useState } from "react";
import { Screen, TopBar, Field, PrimaryButton } from "../../components/ui.jsx";
import { SKILL_OPTIONS } from "../auth/MiniResume.jsx";

export function EditProfileScreen({ mode, profile, onSave, onBack }) {
  const isCompany = mode === "contratar";
  const [name, setName] = useState(profile.name || "");
  const [email, setEmail] = useState(profile.email || "");
  const [phone, setPhone] = useState(profile.phone || "");
  const [city, setCity] = useState(profile.city || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [hasPhoto, setHasPhoto] = useState(profile.hasPhoto || false);
  const [skills, setSkills] = useState(profile.competencies || []);

  const toggleSkill = (s) => setSkills((arr) => (arr.includes(s) ? arr.filter((x) => x !== s) : [...arr, s]));

  const handleSave = () => {
    onSave({ name, email, phone, city, bio, hasPhoto, competencies: skills });
    onBack();
  };

  return (
    <Screen>
      <TopBar title="Editar Perfil" onBack={onBack} />
      <div className="flex-1 px-6 py-6 space-y-4">
        <p className="text-[12.5px] text-slate-500 leading-relaxed">
          {isCompany
            ? "Essas informações aparecem para os profissionais quando visualizam sua empresa."
            : "Essas informações aparecem para contratantes quando visualizam seu perfil."}
        </p>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setHasPhoto(true)}
            className={`relative w-24 h-24 rounded-full flex items-center justify-center border-2 border-dashed transition ${
              hasPhoto ? "border-emerald-300 bg-emerald-50" : "border-slate-300 bg-slate-50"
            }`}
          >
            {hasPhoto ? (
              isCompany ? <Building2 size={28} className="text-emerald-500" /> : <Check size={26} className="text-emerald-500" />
            ) : (
              <div className="flex flex-col items-center gap-1 text-slate-400">
                <ImagePlus size={22} />
                <span className="text-[10px] font-medium">{isCompany ? "Logo da empresa" : "Foto de perfil"}</span>
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center border-2 border-white">
              <Camera size={13} />
            </span>
          </button>
        </div>

        <Field icon={isCompany ? Building2 : User} placeholder={isCompany ? "Nome da empresa" : "Nome completo"} value={name} onChange={(e) => setName(e.target.value)} />
        <Field icon={Mail} type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Field icon={Phone} type="tel" placeholder="Número de celular" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <Field icon={MapPin} placeholder="Cidade" value={city} onChange={(e) => setCity(e.target.value)} />

        <div>
          <p className="text-[12.5px] font-bold text-slate-600 mb-1.5">{isCompany ? "Sobre a empresa" : "Sobre você"}</p>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder={isCompany ? "Conte um pouco sobre o negócio..." : "Conte um pouco sobre sua experiência..."}
            className="w-full p-3.5 rounded-xl border border-slate-200 bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          />
        </div>

        {!isCompany && (
          <div>
            <p className="text-[12.5px] font-bold text-slate-600 mb-2">Principais competências</p>
            <div className="flex flex-wrap gap-2">
              {SKILL_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSkill(s)}
                  className={`px-3 py-1.5 rounded-full text-[12px] font-semibold border-2 transition ${
                    skills.includes(s) ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-500"
                  }`}
                >
                  {skills.includes(s) && <Check size={11} className="inline mr-1 -mt-0.5" />}
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <PrimaryButton className="mt-2" onClick={handleSave}>Salvar alterações</PrimaryButton>
      </div>
    </Screen>
  );
}
