import { CONTACT_INFO, HQ_MAPS_URL } from "../data";
import { gmailComposeLink } from "../gmail";
import { waLink } from "../whatsapp";
import { Award, Check, Logo, Mail, Phone, Pin } from "../icons";
import { Reveal, SectionHead } from "../ui";

export default function Contact() {
  return (
    <>
      <section id="contact" className="grid-light scroll-mt-24 bg-cream">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:py-28">
          <div>
            <SectionHead
              tone="light"
              index="05"
              label="get in touch"
              title="Become a dealer or ask us anything"
              copy="Interested in stocking our lubricants, bulk orders for your fleet, or just need advice on the right oil? Tap the green chat button for live PSO Support, or reach us directly below."
            />

            <div className="mt-10 space-y-5">
              <a href={`tel:${CONTACT_INFO.uan.replace(/\s/g, "")}`} className="flex items-center gap-4 transition-colors group">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-oil text-paper transition-transform group-hover:scale-110"><Phone className="h-5 w-5" /></span>
                <div>
                  <span className="block font-mono text-[10px] tracking-[0.18em] text-fog uppercase">UAN / WhatsApp</span>
                  <span className="font-display text-lg font-bold text-ink">{CONTACT_INFO.uan}</span>
                </div>
              </a>
              <a
                href={gmailComposeLink(CONTACT_INFO.email, "Enquiry from PSO Lubricants website", "Hi PSO Lubricants team,\n\n")}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 transition-colors group"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-oil text-paper transition-transform group-hover:scale-110"><Mail className="h-5 w-5" /></span>
                <div>
                  <span className="block font-mono text-[10px] tracking-[0.18em] text-fog uppercase">Email (opens Gmail)</span>
                  <span className="font-display text-lg font-bold text-ink">{CONTACT_INFO.email}</span>
                </div>
              </a>
              <a
                href={HQ_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-oil text-paper transition-transform group-hover:scale-110"><Pin className="h-5 w-5" /></span>
                <div>
                  <span className="block font-mono text-[10px] tracking-[0.18em] text-fog uppercase">Head Office</span>
                  <span className="font-display text-lg font-bold text-ink">{CONTACT_INFO.hq}</span>
                  <span className="mt-0.5 flex items-center gap-1 font-mono text-[10px] tracking-wider text-moss uppercase">
                    Open in Google Maps
                    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7M9 7h8v8" /></svg>
                  </span>
                </div>
              </a>

              {/* Khanewal HQ photo + video gallery */}
              <div className="mt-2">
                <p className="mb-2.5 font-mono text-[10px] tracking-[0.18em] text-fog uppercase">Khanewal HQ</p>

                {/* looping plant video */}
                <div className="group relative mb-2.5 overflow-hidden rounded-xl border border-sand">
                  <video
                    className="h-40 w-full object-cover sm:h-48"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    poster="/images/hq-exterior.jpg"
                  >
                    <source
                      src="https://videos.pexels.com/video-files/12891231/12891231-hd_1920_1080_30fps.mp4"
                      type="video/mp4"
                    />
                    <source
                      src="https://videos.pexels.com/video-files/12891231/12891231-uhd_3840_2160_30fps.mp4"
                      type="video/mp4"
                    />
                  </video>
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/15 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
                    <div>
                      <span className="flex items-center gap-1.5 font-mono text-[9px] tracking-[0.2em] text-moss uppercase">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="ping-slow absolute inline-flex h-full w-full rounded-full bg-moss opacity-75" />
                          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-moss" />
                        </span>
                        Live plant tour
                      </span>
                      <p className="mt-0.5 font-display text-[13px] font-bold text-paper">
                        Blend plant · Khanewal
                      </p>
                    </div>
                    <a
                      href={HQ_MAPS_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-paper/30 bg-ink/50 px-3 py-1 font-mono text-[9px] tracking-wider text-paper uppercase backdrop-blur transition-colors hover:border-moss hover:text-moss"
                    >
                      Map ↗
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { src: "/images/hq-exterior.jpg", alt: "PSO Khanewal filling station exterior", label: "Station" },
                    { src: "/images/hq-warehouse.jpg", alt: "PSO lubricant warehouse interior", label: "Warehouse" },
                    { src: "/images/hq-office.jpg", alt: "PSO head office reception", label: "Office" },
                  ].map((img) => (
                    <a
                      key={img.src}
                      href={HQ_MAPS_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative overflow-hidden rounded-xl border border-sand"
                    >
                      <img
                        src={img.src}
                        alt={img.alt}
                        className="h-24 w-full object-cover transition-transform duration-500 group-hover:scale-110 sm:h-28"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
                      <span className="absolute bottom-1.5 left-2 font-mono text-[9px] font-semibold tracking-wider text-paper uppercase">
                        {img.label}
                      </span>
                    </a>
                  ))}
                </div>
              </div>

              <a href={waLink("Hi PSO Lubricants, I'd like to ask about your products.")} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 rounded-full bg-moss px-5 py-2.5 font-display text-[13px] font-bold tracking-wide text-paper uppercase transition-transform hover:scale-105">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M17.5 14.5c-.3-.1-1.7-.8-1.9-.9-.3-.1-.5-.1-.7.1-.2.2-.8.9-1 1.1-.2.2-.4.2-.7.1-.3-.1-1.2-.4-2.3-1.4-.9-.8-1.4-1.7-1.5-2 0-.2.1-.4.2-.5.2-.2.4-.3.5-.4.1-.1.1-.2.1-.3 0-.1 0-.3-.1-.4-.1-.1-.7-1.7-1-2.3-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.7.3-.2.2-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3 4.8 4.2.7.3 1.2.4 1.6.5.7.2 1.3.1 1.8-.1.5-.2 1-.6 1.2-1 .2-.5.3-.9.2-1.1-.1-.2-.3-.3-.6-.4zM12 2C6.5 2 2 6.5 2 12c0 2.3.8 4.4 2.1 6.1L2 22l4-2.1c1.5.8 3.2 1.2 5 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2z"/></svg>
                Chat on WhatsApp
              </a>
            </div>
          </div>

          {/* certificate showcase */}
          <Reveal delay={100}>
            <div className="relative overflow-hidden rounded-2xl border border-sand bg-paper p-6 shadow-[0_18px_50px_rgba(11,37,69,0.10)] sm:p-8">
              <span className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-moss/10 blur-2xl" />
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <span className="font-mono text-[10px] tracking-[0.22em] text-oildim uppercase">Certified quality</span>
                  <h3 className="font-display mt-1.5 text-2xl leading-tight font-extrabold text-ink uppercase">
                    Genuine PSO<br />quality certificate
                  </h3>
                </div>
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-moss/40 bg-moss/10">
                  <Award className="h-7 w-7 text-moss" />
                </span>
              </div>

              <div className="relative mt-6 overflow-hidden rounded-xl border border-sand">
                <img src="/images/certificate.jpg" alt="PSO Lubricants quality assurance certificate" className="h-56 w-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-3">
                  <div>
                    <p className="font-mono text-[9px] tracking-[0.2em] text-paper/70 uppercase">Certificate no.</p>
                    <p className="font-mono text-[13px] font-bold text-paper">PSO-QA-04412/Q</p>
                  </div>
                  <span className="rounded-full bg-moss px-3 py-1 font-mono text-[9.5px] font-bold tracking-wider text-paper uppercase">Verified</span>
                </div>
              </div>

              <div className="relative mt-5 grid grid-cols-2 gap-2.5">
                {[
                  { code: "API SP / CK-4", note: "Engine oil licence" },
                  { code: "ACEA 2021", note: "European sequences" },
                  { code: "ISO 9001:2015", note: "Quality management" },
                  { code: "JASO MA2", note: "Wet-clutch approved" },
                ].map((c) => (
                  <div key={c.code} className="rounded-lg border border-sand bg-cream/60 p-3">
                    <p className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-ink">
                      <Check className="h-3 w-3 text-moss" /> {c.code}
                    </p>
                    <p className="mt-0.5 font-mono text-[9.5px] text-clay">{c.note}</p>
                  </div>
                ))}
              </div>

              <p className="relative mt-5 border-t border-sand pt-4 font-mono text-[10.5px] leading-relaxed text-clay">
                Every batch is lab-tested and released against these international standards before it
                leaves our Khanewal plant. Ask any dealer for the batch certificate of analysis.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="border-t border-line bg-coal">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3">
                <span className="text-oil"><Logo className="h-9 w-9" /></span>
                <span className="font-display text-xl font-extrabold tracking-wide text-paper uppercase">PSO <span className="text-oil">Lubricants</span></span>
              </div>
              <p className="mt-4 max-w-sm text-[13px] leading-relaxed text-fog">Premium motor oils, diesel engine oils, gear oils and greases — engineered for maximum engine protection on Pakistani roads.</p>
            </div>
            <div>
              <h4 className="font-mono text-[11px] tracking-[0.18em] text-fog uppercase">Products</h4>
              <ul className="mt-4 space-y-2">
                {["Car engine oils", "Motorcycle oils", "Diesel engine oils", "Gear oils & greases", "Hydraulic oils"].map((p) => (
                  <li key={p}><button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="font-mono text-[12px] text-fog2 transition-colors hover:text-oil">{p}</button></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-mono text-[11px] tracking-[0.18em] text-fog uppercase">Company</h4>
              <ul className="mt-4 space-y-2">
                {["Quality & certifications", "Oil finder", "Become a dealer", "Contact us"].map((p) => (
                  <li key={p}><button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="font-mono text-[12px] text-fog2 transition-colors hover:text-oil">{p}</button></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6 font-mono text-[10px] tracking-wider text-fog uppercase">
            <span>© 2026 PSO Lubricants. All rights reserved.</span>
            <span>Made with pride in Pakistan</span>
          </div>
        </div>
      </footer>
    </>
  );
}
