import { useRef } from 'react';
import { motion } from 'framer-motion';
import { teamMembers } from '../data/portfolio';
import { EASE, SectionHeading } from './fx';
import { RailButtons } from './Rail';

const colors = ['#0d5a40', '#0f4c6e', '#6e0d1d', '#3d1a6e', '#6b3c06'];

export default function Team() {
  const rail = useRef<HTMLDivElement>(null);

  return (
    <>
      <SectionHeading kicker="The people behind the work" title="My Team Members" />
      <div className="group/rail relative">
        <div ref={rail} className="rail gutter flex snap-x snap-mandatory gap-4 overflow-x-auto pb-6">
          {teamMembers.map((member, index) => (
            <motion.article
              key={member.name}
              className="team-member-card relative flex h-[340px] w-[78vw] shrink-0 snap-start flex-col justify-between overflow-hidden rounded-2xl border border-white/10 p-6 sm:w-[42vw] lg:h-[420px] lg:w-[27vw]"
              style={{
                background: `radial-gradient(100% 80% at 90% 0%, ${colors[index % colors.length]} 0%, transparent 65%), linear-gradient(145deg, #111117, #07070a)`,
              }}
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: index * 0.08, ease: EASE }}
            >
              <span aria-hidden className="team-member-ghost absolute -right-5 -top-14 font-display text-[15rem] leading-none text-white/[0.06]">
                {member.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2)}
              </span>
              <div className="relative flex items-center justify-between">
                <span className="team-member-meta text-[10px] font-bold tracking-[0.3em] text-bone/70">TEAM MEMBER {String(index + 1).padStart(2, '0')}</span>
                <span className="team-member-meta rounded-full border border-white/20 px-3 py-1 text-[10px] text-bone/70">{index === 0 ? 'YOU' : 'COLLABORATOR'}</span>
              </div>
              <div className="relative">
                <p className="team-member-role mb-2 text-[10px] font-bold uppercase tracking-[0.28em] text-[#46e3a8]">{member.role}</p>
                <h3 className="font-display text-[clamp(2rem,5vw,3.5rem)] leading-[0.92] text-bone">{member.name}</h3>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-bone/70">{member.impact}</p>
                {member.linkedin && (
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="team-member-link mt-5 inline-flex min-h-11 items-center rounded-md border border-white/25 bg-black/20 px-4 text-sm font-semibold text-bone transition hover:border-white/60"
                  >
                    LinkedIn ↗
                  </a>
                )}
              </div>
            </motion.article>
          ))}
        </div>
        <RailButtons rail={rail} />
      </div>
    </>
  );
}
