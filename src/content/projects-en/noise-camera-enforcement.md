---
summary: "Four scattered requests: a device and site management API, a weather evidence tool, an event review API and an audit dashboard. Placed back on the noise camera enforcement workflow, they close the four gaps an over-limit event passes through: measured, verified, judged and seen."
role: "Data integration and visualization: device and site management API, weather evidence tool, event review API and audit dashboard; image recognition was owned by the image processing team"
metric_labels:
  - "Over-limit events in the audit dashboard (2024/06/21 ~ 2025/09/18)"
  - "Share judged valid by reviewers (236 events)"
  - "On-site conditions checked per event, 3 of them weather"
story:
  - { label: "Map", line: "This is the spine one over-limit event travels: a roadside site measures the sound and writes it to the event database, the weather is verified, a reviewer judges it, and it is finally seen on a dashboard. My part is the four services tagged measured, verified, judged and seen." }
  - { label: "Over the limit isn't a violation", line: "Noise cameras are automated enforcement against modified, noisy vehicles: when the meter reads over the limit, a camera records the vehicle. But over the limit is not a violation yet; by regulation four on-site conditions must be checked before an event is judged valid or invalid." }
  - { label: "What judging needs", line: "Judging one event needs three kinds of evidence: the device readings, on-site images, and three weather conditions: road dry or wet, wind speed and the last rainfall. Only with all of it can a reviewer judge it valid or invalid." }
  - { label: "Problem", line: "The catch is that the evidence sat in four places: the database, file folders, a weather website and an existing work-order program. So the problem is not the judging rules but gathering the evidence by hand for every single case." }
  - { label: "Worked example", line: "Take two illustrative events, both reading 92 dBA: A meets all four conditions and is judged valid; B had wind above 5 m/s, so it is judged invalid." }
  - { label: "Solution", line: "So I put the four piecemeal requests back on this flow: measured by the device and site management API, verified by the weather evidence tool, judged through the event review API, seen on the audit dashboard." }
  - { label: "Measured", line: "Measured: the device and site management API maintains the site, device and calibration records; add a site and the front end updates at once." }
  - { label: "Verified", line: "Verified: one sentence sets the place and period; AI parses it, calls the crawler service for CODiS data, and produces wind and rainfall charts plus a PDF report." }
  - { label: "Judged", line: "Judged: the evidence comes together in the event review API, where the reviewer judges in one place; correcting a plate re-stamps the photo, and the evidence and inspection work order are exported. Its screens are not public, so the evidence card stands in." }
  - { label: "Seen", line: "Seen: judgements roll up into the audit dashboard, where the environmental agency sees totals and the valid share, peak hours and top offending vehicles." }
  - { label: "Result", line: "Each of the four gaps is closed: records have a home, weather is one sentence away, judging and work orders happen in one place, and results are visible at a glance. There is no record of hours, so this page does not estimate time saved." }
impact:
  before: "Judging one event meant hopping between the database, files, a weather site and a legacy system"
  after: "Evidence sits in the review API; judging, plate fixes and work orders happen in one place"
tldr:
  problem: "Over the limit is not yet a violation: every event needs device, image and weather evidence checked by hand, and that evidence lived in different places."
  approach: "Put the scattered requests back on the enforcement workflow: device records are managed, weather evidence is found, events get reviewed, results get seen."
  result: "Reviewers judge events and produce work orders through one API; the agency reads hotspots and peak hours straight from the dashboard."
---

## Problem Assessment

<hr data-slide="Background">

- A **noise camera** is automated enforcement against modified, noisy vehicles: when a roadside noise meter measures sound above the limit, a camera records the vehicle, creating an **over-limit event**.
- **Over the limit is not yet a violation.** By regulation, a reviewer must also check four on-site conditions (a vehicle present in the three seconds around the event, road dry or wet, wind below 5 m/s, time of the last rainfall) before judging the event **valid** or **invalid**.
- The requests that reached me came piecemeal: a device management API, a weather lookup, an event review back end and an audit dashboard. Placed back on the enforcement workflow, they are the four gaps one event passes through: **measured, verified, judged, seen**. Image recognition was owned by the image processing team.

<details class="glossary-details">
<summary>Glossary<span class="mono">8 terms · click to expand</span></summary>
<table>
<thead><tr><th>Term</th><th>Meaning</th></tr></thead>
<tbody>
<tr><td>Noise camera</td><td>Automated enforcement equipment pairing a noise meter with cameras to record loud vehicles at the roadside</td></tr>
<tr><td>Over-limit event</td><td>A record created automatically when noise exceeds the limit, with a photo, a sound waveform and video</td></tr>
<tr><td>Lmax</td><td>The highest noise level measured during the event</td></tr>
<tr><td>L90 / fL90</td><td>Background noise level; fL90 is the calibrated background level</td></tr>
<tr><td>Limit (dBA)</td><td>The noise ceiling that applies at the site</td></tr>
<tr><td>Valid / invalid</td><td>A reviewer's judgement of whether the event can enter enforcement</td></tr>
<tr><td>Inspection notice / direct fine</td><td>The two follow-ups for a valid event: the owner brings the vehicle for testing, or the vehicle is fined directly</td></tr>
<tr><td>CODiS</td><td>The Central Weather Administration's climate observation portal</td></tr>
</tbody>
</table>
</details>

<hr data-slide="What gets judged">

Over the limit only means the noise meter measured sound above the standard. By regulation, a reviewer must also check four on-site conditions before judging the event **valid** or **invalid**, and the evidence for that falls into three groups:

<figure class="evidence-figure">
<div class="evidence-card">
<div class="evidence-groups">
<section class="evidence-group">
<p class="evidence-head"><b>Device measurements</b><span class="evidence-src">Site writes · management API</span></p>
<ul>
<li>Lmax, L90 / fL90, wind, temperature: written to the event database by the site</li>
<li>Limit and calibration records: master data kept by the device and site management API</li>
</ul>
</section>
<section class="evidence-group">
<p class="evidence-head"><b>On-site imagery</b><span class="evidence-src">Image recognition (image team)</span></p>
<ul>
<li>Photo, sound waveform, AI and surveillance video, plate</li>
<li>Vehicle present in the three seconds around the event</li>
</ul>
</section>
<section class="evidence-group is-weather">
<p class="evidence-head"><b>Weather conditions</b><span class="evidence-src">Weather evidence</span></p>
<ul>
<li>Road dry or wet, wind below 5 m/s, time of the last rainfall</li>
</ul>
</section>
</div>
<span class="evidence-arrow" aria-hidden="true">→</span>
<div class="evidence-result">
<div class="evidence-verdict">
<p><b>Judgement</b> (reviewer)</p>
<ul class="evidence-chips"><li>Valid</li><li>Invalid</li></ul>
<p style="margin-top:10px">Reason</p>
<ul class="evidence-chips"><li>Inspection notice</li><li>Direct fine</li><li>Not a noisy vehicle</li><li>Cannot judge</li><li>Other</li></ul>
</div>
<div class="evidence-verdict">
<p><b>Outputs</b></p>
<ul class="evidence-chips"><li>Plate fix with photo re-stamp</li><li>Evidence ZIP</li><li>Inspection work order</li><li>Audit dashboard</li></ul>
</div>
</div>
</div>
<figcaption>Figure 1　The evidence and outputs behind one over-limit event (fields from the event review API's data model)</figcaption>
</figure>

That evidence used to sit in four places: readings in the database, images in file folders, weather looked up on a separate website, and work orders produced by an existing C# program. So the problem to solve is not the judging rules but that **the evidence for each judgement was spread over four places and had to be gathered by hand, case by case**.

<hr data-slide="Worked example">

Two illustrative events show why the same over-limit sound can be judged differently:

| Event | Reading (Lmax / limit) | Vehicles in the 3 seconds | Weather (road / wind / last rain) | Judgement |
|---|---|---|---|---|
| A | 92 / 86 dBA | Met | Met / 2.1 m/s / Met | Valid |
| B | 92 / 86 dBA | Met | Met / **6.3 m/s** / Met | **Invalid** |

*Illustration: values are for explanation; only the wind has a number, because 5 m/s is an explicit threshold, and the other conditions are only marked as met; the 86 dBA limit comes from the test data in the device and site management API recording. Judgements are made by reviewers under the regulation.*

- **A**: all four conditions are met, the reviewer judges it valid, and it moves on to an inspection notice or a direct fine.
- **B**: the wind exceeds 5 m/s, a condition is not met, and it is judged invalid.

<hr data-slide="Four gaps">

<figure class="pain-figure">
<div class="pain-grid">
<section class="pain-card tone-red pain-wide">
<h4 class="pain-title">Judged: evidence spread across four places</h4>
<p class="pain-label"><span>Pain</span>Every event needs its evidence gathered by hand before a decision</p>
<ul class="pain-note">
<li>Measurements sit in the database, imagery in file folders, weather is looked up separately, and the work order comes from an existing C# program; a misread plate also has to be fixed on the photo.</li>
</ul>
<div class="pain-evidence">
<p class="pain-evidence-title">Evidence: review volume (2024/06/21 ~ 2025/09/18, audit dashboard)</p>
<ul class="pain-flow">
<li>Of <b>5,605</b> over-limit events only <b>236 were valid (4.2%)</b>; the other <b>5,369</b> still had to be judged one by one.</li>
</ul>
</div>
</section>
<section class="pain-card tone-grey">
<h4 class="pain-title">Measured: no single place to manage device records</h4>
<p class="pain-label"><span>Pain</span>Meters, calibrators, anemometers, cameras and sites, split across a main and a history database</p>
</section>
<section class="pain-card tone-yellow">
<h4 class="pain-title">Verified: weather looked up by hand</h4>
<p class="pain-label"><span>Pain</span>Three of the four conditions are weather, searched by hand on websites</p>
</section>
<section class="pain-card tone-grey pain-wide">
<h4 class="pain-title">Seen: hotspots and peak hours are hard to read</h4>
<p class="pain-label"><span>Pain</span>Reports were made by hand, hiding priority areas, noisy hours and repeat vehicles</p>
</section>
</div>
<figcaption>Figure 2　The four gaps of one over-limit event</figcaption>
</figure>

## Solution Design

<hr data-slide="Gaps and directions">

**Gap → direction** (matches the data flow map in Quick Read):

- **Measured** → Device and site management API: master data for sites, devices and calibration records (readings go straight from the site to the database), plus monitoring queries and live push, connected to both databases.
- **Verified** → Weather evidence: a CODiS crawler service plus Weather AI, queried in one sentence.
- **Judged** → Event review API: evidence sits on the event; judging, plate fixes, evidence export and work orders all happen here.
- **Seen** → Audit dashboard: judged events by time, site and plate, with filters and downloads.

**Constraints:** event data lives in two SQL Server databases; the work order keeps the existing C# program's format; the system runs on a local network.

## Alternative Solutions

| Gap | Adopted | Not chosen | Why |
|---|---|---|---|
| Measured | **FastAPI service layer** | Front ends query the database directly | Several front ends share the data; SQL and connections to two databases are written once |
| Verified | **Crawler service + natural-language queries** | Look up CODiS by hand | One sentence sets place and period, fast enough for the event volume |
| Judged | **Keep the C# generator, linked by file exchange** | Rewrite the work order in Python | The work order is the form the agency uses; its format cannot change |

## Selected Solution

<hr data-slide="Four modules">

- **Device and site management API**: create, read, update and delete plus file upload for site, device and calibration records; query and download for wind, noise and calibration data ([sensor/api.py](https://github.com/01080710/NoiseDetect_API/blob/HEAD/app/routers/sensor/api.py)); live data pushed over WebSocket ([live/api.py](https://github.com/01080710/NoiseDetect_API/blob/HEAD/app/routers/live/api.py)).
- **Weather evidence**: a Selenium crawler wrapped as a "place + month" API service. Weather AI uses GPT-4o-mini and LangChain to parse the place and time in a sentence ([chat_prompt.py](https://github.com/01080710/WeatherAI/blob/HEAD/StreamlitWeb/models/date/chat_prompt.py)), Google Maps for coordinates ([address_logic.py](https://github.com/01080710/WeatherAI/blob/HEAD/StreamlitWeb/models/address/address_logic.py)), concurrent calls to the crawler with retries ([codis_api.py](https://github.com/01080710/WeatherAI/blob/HEAD/StreamlitWeb/models/codis_api.py)), then charts and a PDF report ([combine_generate.py](https://github.com/01080710/WeatherAI/blob/HEAD/StreamlitWeb/models/pdf_tool/combine_generate.py)).
- **Event review API**: judgements write only the changed fields; a plate fix re-stamps the photo with Pillow so evidence matches data; evidence exports as a ZIP per plate; the work order returns once the existing C# program has converted it, with a time-out error.
- **Audit dashboard**: Streamlit and Plotly, six view modes; filters by time, site, judgement, noise limit and wind; rankings of loudest, repeat and cross-area vehicles; CSV download.
- **Access scope**: on the event table the review API writes only the judgement, reason and plate fields and reads the rest; connection details live in environment variables.
- **Source code**: [01080710/WeatherAI](https://github.com/01080710/WeatherAI), [01080710/NoiseDetect_API](https://github.com/01080710/NoiseDetect_API); the event review API and crawler service repos are not public for now.

## Result

<hr data-slide="Measured: device and site management API">

<figure class="video-figure">
<div class="video-grid">
<div class="video-item">
<p class="video-label">The recording highlights five steps in turn</p>
<video controls muted playsinline preload="metadata" src="../../../media/noise-camera-enforcement/device-site-api-en.mp4"></video>
</div>
</div>
<figcaption>Figure 3　Five steps of the device and site management API: (1) POST /site writes the site record; (2) GET /site reads it back, including the noise limit and connection IP; (3) the front end shows the new site; (4) a site document is uploaded; (5) PUT sets the status to inactive. Test data. Source: <a href="https://github.com/01080710/NoiseDetect_API">NoiseDetect_API</a></figcaption>
</figure>

<hr data-slide="Verified: weather evidence">

<figure class="video-figure">
<div class="video-grid">
<div class="video-item">
<p class="video-label">The recording highlights five steps in turn</p>
<video controls muted playsinline preload="metadata" src="../../../media/noise-camera-enforcement/weather-evidence-en.mp4"></video>
</div>
</div>
<figcaption>Figure 4　Five steps of the weather evidence tool: (1) one sentence sets the place and period; (2) AI extracts the place, coordinates and period; (3) the crawler service picks a station and pulls the CODiS monthly report (a separate demo query, so the station differs from step 1); (4) the weather the review needs: wind (with alert lines) and rainfall; (5) a one-click PDF report. Source: <a href="https://github.com/01080710/WeatherAI">WeatherAI</a>; the crawler call is in <a href="https://github.com/01080710/WeatherAI/blob/HEAD/StreamlitWeb/models/codis_api.py">codis_api.py</a></figcaption>
</figure>

<hr data-slide="Seen: audit dashboard">

<figure class="video-figure">
<div class="video-grid">
<div class="video-item">
<p class="video-label">The recording highlights four insights in turn</p>
<video controls muted playsinline preload="metadata" src="../../../media/noise-camera-enforcement/audit-dashboard-en.mp4"></video>
</div>
</div>
<figcaption>Figure 5　Four insights from the audit dashboard: (1) totals and the valid share; (2) peak hours, events by weekday × hour; (3) top offending vehicles, ranked by peak noise, repeat count and areas covered; (4) filtering by judgement, noise limit, wind and temperature before downloading. Plates, site codes and the download path are pixelated</figcaption>
</figure>

## Impact

<hr data-slide="Verified results">

### Verified results

<figure class="ba-figure">
<div class="ba-table">
<div class="ba-row ba-head"><p class="ba-item">Gap</p><p class="ba-before">Before</p><p class="ba-after">After</p></div>
<div class="ba-row"><p class="ba-item">Measured</p><p class="ba-before">No single place to manage device records</p><p class="ba-after">One API maintains site, device and calibration records, and the front end stays in sync<small>Source: Figure 3</small></p></div>
<div class="ba-row"><p class="ba-item">Verified</p><p class="ba-before">Weather searched by hand</p><p class="ba-after">One sentence returns CODiS data and a report<small>Source: Figure 4</small></p></div>
<div class="ba-row"><p class="ba-item">Judged</p><p class="ba-before">Evidence spread across four places</p><p class="ba-after">One event carries all its evidence; judging and work orders go through one API<small>Source: Figure 1</small></p></div>
<div class="ba-row"><p class="ba-item">Seen</p><p class="ba-before">Hand-made reports; hotspots judged by experience</p><p class="ba-after">The dashboard shows totals, hotspots, peak hours and repeat vehicles directly<small>Source: Figure 5</small></p></div>
</div>
<figcaption>Figure 6　Before / After for the four gaps</figcaption>
</figure>

<hr data-slide="Not yet quantified">

### Not yet quantified, or worth explaining

- **No time data**: time per judgement and how long weather lookups used to take were never recorded, so no hours saved are estimated.
- **5,605 is data size, not an outcome**: events start 2024/06/21, before I joined (2025/02); judgements were made by reviewers.
- **No screens for judging**: the event review API's screens are not public, so this page explains its inputs and outputs with the evidence card (Figure 1).
- **Scope**: image recognition belonged to the image processing team; the four modules were separate requests, arranged here along the enforcement workflow as one data chain.
