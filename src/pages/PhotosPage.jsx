// pages/PhotosPage.jsx
import { useState } from "react";
import { FadeIn, SpadeIcon } from "../shared";

const galleries = [
  {
    title: "LM vs Conestoga",
    date: "January 28, 2026",
    coverId: "1Jk0yVNO5G48tm5JZdLAiTzglbpEGbfHM",
    ids: [
      "1Jk0yVNO5G48tm5JZdLAiTzglbpEGbfHM","19nHWLfxmN1Oasbt3PjCaBBOtbDkc4Qc2","1s8WJAe9PN2iKolWIc5BEGpG5Cnl8Q26L",
      "1eVEQIjksGWM2K4N3E1frUsPpE6YgF-hl","13lATB9I6Cv452ZAZBme9PuyMjYvGOJqY","1NNFvu0DN7NlmtZJPg0t9cfK1m-aY2KAQ",
      "1C58EBV8BsHc7qUyJ8zfVc9KWW8PW8bru","161RfOzf3GD8h-lQ4V56WmSKRvxH4l7SJ","1rvjpA_9BqjDZBHpsvH_hxaUWvSV7QbP_",
      "1opDl4s9BFxe7Qgbb2hDltU_dxOy2b0iC","1ZZydwVnwe8YqqwTTINCwddGhnmuGEbtv","1w2k2aHISet03QjrJgPLpNvOSH2fEn1Qz",
      "1FZaz0FGJkIltipxWDJFiAViwUHztsF_O","1j7DoHrduFDCZ_oJf1P6bZNbcocMnSsCZ","1GlUxcNptpfn8h7ePtST8QzXDTQSzF_Fl",
      "1kgr95Ov4ouj9NdwC3K_MShqVQp3TSN6U","18CXmRV9W6ZkJsyd62vyvwgdyAxLUtjwQ","1yF1oiDr6_T8UiS_L7T6vfzKYjf9wkRif",
      "1nMNA8gEPj9SI_XVGlCtlsueXJGzwntEo","1TIDUpFRrOru3XsLaX4TgllC9WC6XxMRJ","1F9XtweQenYsZvQUoUadDWev9QbAwyNI_",
      "1VU3ZuLiCS5zxsD4bx8wRJUlRiFyHz9Oq","1V1WAxwUf4Bc3CoFjR4URcoQxabuJfd1j","1c8HHIBzVhg7pfjaZw9f7T3iVI9oL_Z7R",
      "1PEK2jDDgWu7A_-izdiLilZ4xbpI06sNP","1uToiffl2xKwLEyQdt_MUm3TYE37Sxrav","1cVqgwMpCigd1mEpHLO8POHZT6kxFofVC",
      "1hLJECavHl-5-MX6Noa7JEfVTUN0D92eN","1IS5ZPrgrCaN_oLk5j4zUsAn4WtQCdW1u","1rtgFaUKM7APegvg46JdZzOsX-pDxEwB_",
      "1m9NgpznVL3qxObx0kibt4WMohzD6WRmo","1bTb0qexvTrHyXOmHgWaNRz_1UjAQtSQW","1OA8vIQN4fX6p5iSUbP8wIRWazjCmhjFe",
      "1wMDZfLhlrZQnTg0G7A38OTm5nv1M9kq-","10-xEjNdZJl8nN3rIgPGuGVELIH44UC6p","19Jvp51xS7omRH3eniIejnqiF0aplgU3I",
      "15xE6ZKsk6W0QMzR-NtB5N2DIOT1QrCu8","1kjerhMN7DkyXrSymHg98BgTHRQhXbd76","1hCzMZxqJDzFHJN9GuI6cZP1RJ8R_kM1F",
      "1vBeq_QPHf4yBmnAM7zVjEOyY5Xiby7UH","13Cx6ZP0wv6jAE4RcAZjSBqR6RycLq3Rw","1unYvZ7jB3IheOPwiX_pASss_NBHtYOYP",
      "1OChijwjFXGfWPP1wFgIt1lX1Vwqf91F8","1x8FOb-PyS2IBQHfCkbm0Y3aadFbgFhDU","1LNhThIpw-EqY92P2XP_PIpOnEEhxH4No",
      "1_Y0UrTfTup_QV8Ccr4YIDS4DcE6E1jC8","1KARyXO9P59n9NPmKufLXmp6ZnuK0IJvK","1he110z8wtBSJvA-536td7KffvMdRgRvU",
      "1Yv8YsQFOL9tmCMq6HHtusR4aziovAV7x","1rxUx0J7AHKkS-ZSsWeoUapF06YgtsveR",
    ],
  },
];

const toUrl = (id) => `https://lh3.googleusercontent.com/d/${id}=s800`;

export default function PhotosPage() {
  const [openGallery, setOpenGallery] = useState(null);
  const [lightbox, setLightbox] = useState(null);

  return (
    <section id="photos" style={{ background: "#0a0005", padding: "120px 5% 100px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeIn>
          <div className="section-label"><SpadeIcon size={14} color="#840036" /> Game Day</div>
          <h2 className="section-title">Photo<br /><span style={{ color: "var(--gold)" }}>Gallery</span></h2>
          <div className="divider" />
        </FadeIn>

        {/* Gallery Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16, marginTop: 48 }}>
          {galleries.map((gallery, gi) => (
            <FadeIn key={gi} delay={gi * 0.05}>
              <div
                onClick={() => setOpenGallery(openGallery === gi ? null : gi)}
                style={{
                  borderRadius: 12, overflow: "hidden", cursor: "pointer",
                  border: openGallery === gi ? "2px solid var(--gold)" : "2px solid rgba(255,255,255,0.1)",
                  transition: "all 0.3s ease",
                  background: "linear-gradient(135deg, rgba(132,0,54,0.3), rgba(0,0,0,0.8))",
                  minHeight: 180, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 24,
                }}
              >
                <div style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>{gallery.date}</div>
                <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 22, fontWeight: 500, marginBottom: 8 }}>{gallery.title}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{gallery.ids.length} photos</span>
                  <span style={{ color: "var(--gold)" }}>{openGallery === gi ? "▲" : "▼"}</span>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Expanded Gallery */}
        {openGallery !== null && (
          <FadeIn>
            <div style={{ marginTop: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "28px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div>
                  <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 18 }}>{galleries[openGallery].title}</div>
                  <div style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{galleries[openGallery].date}</div>
                </div>
                <button onClick={() => setOpenGallery(null)} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", padding: "8px 20px", borderRadius: 6, cursor: "pointer", fontFamily: "'Source Sans 3', sans-serif", fontSize: 13 }}>Close ✕</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 4 }}>
                {galleries[openGallery].ids.map((id, idx) => (
                  <div key={idx} onClick={() => setLightbox({ galleryIndex: openGallery, photoIndex: idx })} style={{ aspectRatio: "1", overflow: "hidden", cursor: "pointer", background: "#1a1a1a", borderRadius: 4 }}>
                    <img
                      src={toUrl(id)} loading="lazy" alt=""
                      style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s ease" }}
                      onMouseEnter={e => e.target.style.transform = "scale(1.08)"}
                      onMouseLeave={e => e.target.style.transform = "scale(1)"}
                      onError={e => { e.target.style.display = "none"; }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        )}

        {/* Lightbox */}
        {lightbox && (() => {
          const g = galleries[lightbox.galleryIndex];
          const id = g.ids[lightbox.photoIndex];
          const hasPrev = lightbox.photoIndex > 0;
          const hasNext = lightbox.photoIndex < g.ids.length - 1;
          return (
            <div onClick={() => setLightbox(null)} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.95)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", cursor: "zoom-out" }}>
              <button onClick={() => setLightbox(null)} style={{ position: "absolute", top: 20, right: 20, background: "none", border: "none", color: "#fff", fontSize: 32, cursor: "pointer", zIndex: 10001, width: 44, height: 44 }}>✕</button>
              {hasPrev && (
                <button onClick={e => { e.stopPropagation(); setLightbox({...lightbox, photoIndex: lightbox.photoIndex - 1}); }} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", fontSize: 28, cursor: "pointer", zIndex: 10001, borderRadius: "50%", width: 48, height: 48 }}>‹</button>
              )}
              <img src={toUrl(id)} onClick={e => e.stopPropagation()} referrerPolicy="no-referrer" style={{ maxWidth: "90vw", maxHeight: "90vh", objectFit: "contain", borderRadius: 4, cursor: "default", boxShadow: "0 0 80px rgba(0,0,0,0.8)" }} alt="" />
              {hasNext && (
                <button onClick={e => { e.stopPropagation(); setLightbox({...lightbox, photoIndex: lightbox.photoIndex + 1}); }} style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", fontSize: 28, cursor: "pointer", zIndex: 10001, borderRadius: "50%", width: 48, height: 48 }}>›</button>
              )}
              <div style={{ position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)", fontFamily: "'Oswald', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.5)" }}>
                {lightbox.photoIndex + 1} / {g.ids.length}
              </div>
            </div>
          );
        })()}
      </div>
    </section>
  );
}
