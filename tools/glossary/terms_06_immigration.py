"""Glossary cluster: student visa status and work authorisation vocabulary. Data only; rendering lives in engine.py."""

CLUSTER = {
 "order": 6,
 "slug": "immigration-student",
 "short_name": "Student visas",
 "set_name": "Student Visa and Work Authorisation Terms",
 "title": "Student Visa Glossary: F-1, CPT, OPT, H-1B Terms",
 "desc": "Definitions of F-1 status, Form I-20, SEVIS, CPT, OPT, STEM OPT, I-539, unlawful presence, H-1B and cap-exempt. General information, not legal advice.",
 "og_title": "Student Visa Glossary: F-1, CPT, OPT and H-1B Terms",
 "og_desc": "F-1 status vs the visa stamp, the I-20, SEVIS, CPT and OPT, the STEM extension, I-539, unlawful presence, H-1B and cap-exempt, defined carefully.",
 "crumb": "Student Visas",
 "about": ["F-1 student status", "Work authorisation", "United States immigration"],
 "eyebrow": "Glossary · Student visas",
 "h1": "The status vocabulary, defined without the folklore",
 "lead": "Almost every serious mistake international students make with their status starts as a vocabulary error: confusing the visa with the status, assuming a DSO signature is work authorisation, or treating a contested legal question as if it were a settled date on a calendar. These definitions are written to be precise about what is known, and equally precise about what is not. Where a rule is genuinely unsettled, this page says so instead of inventing a clean answer.",
 "card_title": "Student visas and work authorisation",
 "card_desc": "F-1 status, the I-20, SEVIS, CPT and OPT, the STEM extension, I-539, unlawful presence, H-1B and cap-exempt employers. Written to be careful where the rules are contested.",
 "disclaimer": "This page is general educational information about commonly used immigration terminology. It is <strong>not legal advice</strong>, it does not create an attorney-client relationship, and it is not a substitute for advice about your own case. Immigration rules, agency policy, filing fees, processing details and even the interpretation of long-standing regulations change frequently, sometimes through litigation rather than through a published rule. <strong>Consult your school's DSO or a licensed immigration attorney before you act on anything here.</strong>",

 "intro": [
  ("p", "This cluster covers the terms that appear on the forms, in job postings and in the advice students give each other. The last of those three is the dangerous one. Status rules are unusually prone to confident folklore, partly because the words are similar to each other and partly because the true answer to a lot of questions is genuinely \"it depends on your record.\""),
  ("warn", "Read this twice: <strong>nothing on this page is advice about your situation, and you should not make a filing, accept an offer, start work, or book travel based on it.</strong> A definition that is correct in general can be wrong for you because of one line in your SEVIS record, one prior application, or one policy change that landed last month. The people qualified to tell you what applies to you are your DSO and a licensed immigration attorney. Talk to them <em>before</em> you act, not after, because most of the expensive errors in this area cannot be undone once the filing is in or the plane has taken off."),
  ("h2", "The two distinctions that cause the most damage"),
  ("p", "First, a <strong>visa</strong> is not a <strong>status</strong>. A visa is a travel document placed in a passport by a consulate abroad, and its only job is to let you ask to be admitted at a port of entry. Status is the classification you hold once you are inside the country. They expire on different clocks and for different reasons, and confusing the two produces both needless panic and dangerous complacency."),
  ("p", "Second, an <strong>authorisation</strong> is not an <strong>eligibility</strong>. Being eligible for a benefit does not mean you have it. CPT exists on a new I-20 before the first day of work or it does not exist at all. OPT exists as a card issued by USCIS or it does not exist at all. An employer saying yes, a professor saying it counts for credit, and a start date already in the calendar are not authorisation. If you want to see how the pieces sequence against real dates, the <a href=\"/visa.html\">visa timeline planner</a> lays the deadlines out backwards from the day you would need to start work."),
 ],

 "terms": [

  {
   "slug": "f-1-visa",
   "term": "F-1 status",
   "aka": ["F-1 student status", "F-1 visa"],
   "short": "F-1 status is the lawful classification a nonimmigrant student holds inside the United States while enrolled at an SEVP-certified school, which is distinct from the F-1 visa stamp that is used only to seek entry at the border.",
   "body": [
    ("p", "The single most useful thing to understand about F-1 is that the phrase \"F-1 visa\" is used to mean two different objects. The <strong>visa</strong> is a foil placed in a passport by a United States consulate abroad, after a DS-160 application and an interview. It is a travel document. Its only function is to let you present yourself at a port of entry and ask a Customs and Border Protection officer for admission. It does nothing at all once you are inside the country."),
    ("p", "The <strong>status</strong> is the classification you are admitted in and then hold while you are here. It is evidenced by your I-94 admission record together with a valid Form I-20, and it is maintained by doing the things F-1 requires: full-time enrolment as your school defines it, making normal progress toward the degree, keeping your SEVIS record accurate, reporting address changes, and not working without authorisation. Status is a behaviour, not a document."),
    ("p", "F-1 students are commonly admitted for <strong>duration of status</strong>, usually printed as D/S, rather than for a fixed end date. That means the authorised period runs as long as you keep complying with the terms of the classification, plus any grace period, rather than expiring on a date you can read off a stamp. This is convenient and it is also why the unlawful presence question for students is unusually murky, which is covered separately below."),
    ("p", "The practical consequence: an expired visa foil is a travel problem, not a status problem. You can hold perfectly valid F-1 status for years with a long-expired visa in your passport. You simply cannot re-enter the country on it, so if you leave, you have to apply for a new visa at a consulate before you come back, and that application can be delayed or refused for reasons that have nothing to do with your record at school."),
   ],
   "example": "A student's visa foil expires in the second year of a four-year degree. Nothing happens. They keep studying, keep full-time enrolment, keep a valid I-20, and remain in lawful F-1 status until graduation. The expired foil only becomes relevant the day they consider flying home for a wedding, because returning requires a new visa appointment at a consulate, with whatever wait time that post has.",
   "misconception": "That an expired visa stamp means you have fallen out of status. It does not. The visa governs entry; the status governs presence. The reverse error is more dangerous and less discussed: a visa that is still valid for years does not protect you if you stop meeting the conditions of the classification, because a violation of status is not cured by an unexpired foil in the passport.",
   "see": ["i-20", "sevis", "dso", "unlawful-presence"],
  },

  {
   "slug": "i-20",
   "term": "Form I-20",
   "aka": ["Certificate of Eligibility for Nonimmigrant Student Status"],
   "short": "Form I-20 is the Certificate of Eligibility for Nonimmigrant Student Status, issued by an SEVP-certified school and signed by a DSO, which a student uses to apply for an F-1 visa, to enter the country, and to support benefit requests.",
   "body": [
    ("p", "The I-20 is the paper spine of the whole arrangement. The school generates it from its SEVIS record after admitting you and confirming you have shown sufficient funding, a DSO signs it, and you sign it. It carries your SEVIS identification number, your program of study, the program start and end dates, the estimated cost of attendance and funding, and any authorisations the DSO has entered, including CPT and OPT recommendations."),
    ("p", "It gets used at four moments, and it is worth knowing all four because students often think of it as a one-time admission artefact. You need it to pay the SEVIS fee and to attend the visa interview. You need it in hand, not in checked baggage, when you present yourself at the port of entry. You need a current one to support applications for benefits. And you need a valid travel endorsement signed by a DSO on it if you leave the country and intend to be readmitted in the same status."),
    ("p", "A new I-20 is issued whenever something material changes: a change of major or degree level, a change of funding, an extension of the program end date, a transfer between schools, and any CPT authorisation. Keep every version you are ever issued, permanently. Old I-20s are the evidence trail of what was authorised and when, and that record has a way of mattering years later during an adjudication of something else entirely."),
    ("p", "Travel endorsements carry their own expiry, which is commonly shorter for students on post-completion OPT than for students still enrolled. Do not guess at the window. Ask your DSO for the current rule and get the signature before you book the flight, not the week you fly."),
   ],
   "example": "A student changes from a general Computer Science track to a joint track with Applied Mathematics. The degree level is the same, but the program of study on the record has changed, so the school reissues the I-20 with the corrected major and the student signs the new copy. The old one is not shredded; it goes in the same folder as every other version.",
   "misconception": "That the I-20 is a work authorisation document by itself. It is not. It is a certificate of eligibility for a status, and it can record an authorisation the DSO granted, but it is the DSO's CPT entry on the form that authorises CPT, and for OPT it is the card USCIS issues, not the I-20, that authorises the work.",
   "see": ["f-1-visa", "sevis", "dso", "cpt", "opt"],
  },

  {
   "slug": "sevis",
   "term": "SEVIS",
   "aka": ["Student and Exchange Visitor Information System"],
   "short": "SEVIS is the United States government database that tracks F and M nonimmigrant students and J exchange visitors, holding one electronic record per person that schools update and that is identified by a SEVIS identification number printed on the I-20.",
   "body": [
    ("p", "SEVIS is administered through the Student and Exchange Visitor Program within the Department of Homeland Security. Every F, M and J participant has a record in it, and that record is the government's authoritative view of your situation: which school you belong to, which program, which dates, your address, your dependants, and every benefit that has been authorised or ended."),
    ("p", "The record has a state. Common ones are Initial before you arrive and are registered, Active once the school registers you for the term, Completed at the normal end of a program, and Terminated when something has gone wrong or a program has ended early. That state is not cosmetic. A terminated record can mean the end of the benefits attached to the status, and it can appear in later adjudications of anything else you file."),
    ("p", "Separately from any visa fee, there is an <strong>I-901 SEVIS fee</strong>, paid by the student to fund the system, generally before the visa interview and tied to the specific SEVIS identification number on the I-20. Keep the receipt. It is one of the documents most often needed and least often kept."),
    ("p", "Because SEVIS is where the government looks, the accuracy of your record matters more than the accuracy of anything your school tells you verbally. Address changes, dependant changes, employer changes on OPT, and any interruption to enrolment have reporting obligations attached, some of them with short deadlines. The obligation to report generally sits with you, even though the DSO is the one who types it in."),
   ],
   "example": "A student moves apartments mid-semester. The lease, the bank and the university billing system all get updated, but not the SEVIS record, because the student assumed the university address field was the same field. It is not. The reporting obligation is separate and time-limited, and the fix is an email to the DSO, not to the registrar.",
   "misconception": "That SEVIS is just university paperwork. It is a federal tracking system, and its contents are read by consular officers deciding a visa application, by CBP officers deciding an admission, and by USCIS officers deciding a petition. What is in the record is what the government believes about you.",
   "see": ["i-20", "dso", "f-1-visa"],
  },

  {
   "slug": "dso",
   "term": "DSO (Designated School Official)",
   "aka": ["Designated School Official", "PDSO"],
   "short": "A DSO is the school employee designated by an SEVP-certified institution and authorised by the government to advise F and M students, update their SEVIS records, issue and sign Forms I-20, authorise CPT, and recommend OPT.",
   "body": [
    ("p", "Every SEVP-certified school nominates a Principal Designated School Official and one or more DSOs. They are the only people with write access to your SEVIS record, and their signature on the I-20 is the operative act for several benefits. In practical terms they sit inside an international student services office, though the title is a federal designation rather than a job title the university invented."),
    ("p", "The scope of what a DSO can do is wider than students assume for some things and narrower for others. They can authorise CPT directly, which is why CPT can be arranged in days rather than months. They can only <em>recommend</em> OPT in SEVIS; the actual grant comes from USCIS. They can advise on reduced course loads, program extensions, transfers, reinstatement and travel endorsements. They generally cannot advise on other classifications, on family petitions, or on the consequences of a status problem for a future immigration benefit, and a good DSO will tell you when you have reached that line."),
    ("p", "Use them as the first call, not the last resort. The pattern that produces most avoidable problems is a student who researches a question on a forum, acts on the consensus answer, and tells the DSO afterwards. Forum consensus is generated by people whose facts differ from yours in ways neither of you can see, and it is frequently out of date by a policy cycle. The DSO can read your actual record."),
    ("p", "One caveat worth naming: DSOs are not lawyers, they are administering a program, and their institutional incentive is compliance rather than advocacy. When a question is contested, when a filing has been denied, or when something in your history could be characterised as a status violation, that is the point to add a licensed immigration attorney, not to press the DSO for an opinion they are not positioned to give."),
   ],
   "example": "A student is offered a paid summer internship starting 2 June. The right first message, sent in March, is to the DSO: here is the offer, here is the employer, here are the dates, what authorisation does this require and how long does it take. That one email is the whole difference between a clean CPT authorisation and a start date that has to be pushed.",
   "misconception": "That a DSO's verbal \"that should be fine\" is authorisation. It is not, and it is not a defence later. Authorisation is a record: a CPT entry on a new I-20, a SEVIS recommendation, an approval notice, or a card. Get it in writing and get it before the start date.",
   "see": ["i-20", "sevis", "cpt", "opt"],
  },

  {
   "slug": "td-status",
   "term": "TD status",
   "aka": ["TN dependant status"],
   "short": "TD status is the derivative nonimmigrant classification held by the spouse or unmarried minor child of a TN professional, where TN is the classification available to Canadian and Mexican citizens under the professional provisions of the USMCA, formerly NAFTA.",
   "body": [
    ("p", "TN is a nonimmigrant classification created by the North American trade agreement and continued under the USMCA. It lets Canadian and Mexican citizens work in the United States in a listed professional occupation for a United States employer, subject to the qualifications the agreement specifies for that occupation. TD is the accompanying classification for the family members of a TN professional."),
    ("p", "TD is <strong>derivative</strong>, which is the defining feature and the source of most of its risk. It exists because of somebody else's status, it is generally tied to the principal's period of admission, and it ends when the qualifying relationship ends or the principal's TN ends. Nothing about a TD dependant's own conduct keeps it alive. Note also that the eligible child category is limited by age and marital status, and reaching that limit ends eligibility, so the relevant date should be confirmed against the actual immigration documents rather than assumed."),
    ("p", "Two points that matter enormously and are often stated backwards. <strong>TD dependants may study.</strong> Attending school in TD status is permitted, which is why some dependants complete entire degrees without ever holding F-1. And <strong>TD status is generally not employment-authorised.</strong> There is no work authorisation incident to the classification and no application that converts a TD into a worker. That is a plain rule, and it is not softened by the work being remote, unpaid-then-paid, freelance, self-directed, or for a foreign client."),
    ("p", "Because \"work\" in immigration law is not defined the way people define it in conversation, any income-producing activity of any kind is a question for a licensed immigration attorney before it starts, not after. The consequences of getting it wrong are not a fine. They can include a denied application for a change of status later, and the categories that carry long re-entry bars are unforgiving in a way that ordinary regulatory mistakes are not."),
   ],
   "example": "A TD dependant enrolls full-time at a state university, pays tuition, and completes a degree, all of which is permitted. The same person considering any paid or revenue-generating activity alongside it, including something structured as freelance or self-employment, has crossed into a question that only an attorney should answer.",
   "misconception": "That TD dependants cannot study, which is wrong, or that TD dependants can work because they are lawfully present, which is also wrong and is by far the more expensive of the two errors. Lawful presence and work authorisation are separate concepts; holding one says nothing about holding the other.",
   "see": ["f-1-visa", "i-539", "unlawful-presence", "visa-sponsorship"],
  },

  {
   "slug": "cpt",
   "term": "CPT (Curricular Practical Training)",
   "aka": ["Curricular Practical Training"],
   "short": "CPT is training that is an integral part of an established curriculum, authorised by a DSO on a new Form I-20 for a specific employer and specific dates before the work begins, generally after one full academic year of enrolment.",
   "body": [
    ("p", "CPT is the fast route, and the speed comes from where the authority sits. Your DSO enters it in SEVIS and issues a new I-20 carrying the authorisation. No filing to USCIS, no fee, no card, no adjudication queue. In a well-run office it is a matter of days rather than months."),
    ("p", "The trade-off is that it is heavily conditioned. The training must be an <strong>integral part of an established curriculum</strong>, which in practice means it is required for the degree or it is credit-bearing through a course your institution actually offers. It is <strong>employer-specific and date-specific</strong>: authorised for that company, for that period. Change employer, change dates, or extend the internship, and you need a new authorisation before the change, not after."),
    ("p", "Eligibility generally requires one full academic year of lawful full-time enrolment before CPT can be used. The recognised exception is for graduate programs whose curriculum requires immediate participation in practical training, which is the doorway that \"Day-1 CPT\" programs claim to walk through."),
    ("p", "The rule that ends careers-in-planning is the OPT interaction. <strong>Twelve months or more of full-time CPT eliminates OPT eligibility</strong> at that education level. Part-time CPT does not carry that consequence. Full-time and part-time are defined by hours per week, with the dividing line commonly given as twenty hours, so confirm with your DSO exactly which side of it your offer sits on before you accept. The counter is cumulative across the level, not per employer, and it does not reset when you switch companies."),
    ("warn", "The twelve-month figure is a cliff, not a slope. Eleven months of full-time CPT costs you nothing in OPT eligibility. Twelve costs you all of it. If you are stacking multiple internships at the same degree level, count the days in writing and have your DSO confirm the total before you sign anything."),
   ],
   "example": "A master's student takes a full-time summer internship on CPT for roughly three months, then a part-time term-time role on CPT for two semesters. The full-time months accumulate toward the twelve-month threshold; the part-time months do not carry the same consequence. The student asks the DSO for a written running total before accepting a second full-time summer.",
   "misconception": "That CPT is a general permission to work while studying. It is not. It is credit-bearing training tied to one employer and one date range, and working a day outside those parameters, including staying on past the authorised end date, is unauthorised employment rather than a paperwork lapse.",
   "guide": ("/guides/cpt-vs-opt.html", "CPT vs OPT for F-1 students"),
   "see": ["opt", "day-1-cpt", "dso", "i-20"],
  },

  {
   "slug": "day-1-cpt",
   "term": "Day-1 CPT",
   "short": "Day-1 CPT refers to programs at certain schools that authorise Curricular Practical Training from a student's first term, relying on the regulatory exception for graduate curricula that require immediate practical participation, and it is legally contested and carries real risk.",
   "body": [
    ("p", "The regulatory hook is genuine. The one-academic-year prerequisite for CPT has an exception for graduate students whose program requires immediate participation in practical training. A small number of institutions build entire degree programs around that exception, typically with weekend or low-residency classroom components and full-time employment as the practical element."),
    ("p", "The dispute is about whether particular programs actually meet the standard. The regulatory language requires the training to be an integral part of an established curriculum, and the contested question is whether a program where the classroom component is minimal and the employment is the point satisfies that, or whether the curriculum has been arranged around the work rather than the other way round."),
    ("p", "That question has not stayed theoretical. Institutions offering these programs have drawn federal scrutiny, and enforcement action against a school reaches its students, who did not do anything the school told them was wrong. The risk is also downstream: a later visa application, a change of status, or an employer-sponsored petition can be adjudicated by an officer who reads a Day-1 CPT history as a period of unauthorised employment. Nothing published resolves this cleanly in either direction, which is precisely the problem."),
    ("p", "The honest position is neither endorsement nor condemnation. Some students in these programs have proceeded without incident. Others have had subsequent applications questioned or refused. What is not defensible is treating it as ordinary, because the legal question is open and the downside is asymmetric: the benefit is one convenient work period, and the cost, if an officer takes the other view, can attach to every application you make afterward."),
    ("warn", "This is the single term on this page where you should not act on general information at all. If you are considering a Day-1 CPT program, or already in one, get an opinion from a licensed immigration attorney about your specific program and your specific record before the next filing, the next entry, or the next job change."),
   ],
   "misconception": "That a school offering the program is proof the program is compliant. A school's willingness to issue the authorisation is a business decision made by the school, and it does not bind the officer who later reviews your history. The consequences of an adverse view fall on the student, not on the institution.",
   "guide": ("/guides/cpt-vs-opt.html", "CPT vs OPT for F-1 students"),
   "see": ["cpt", "opt", "unlawful-presence"],
  },

  {
   "slug": "opt",
   "term": "OPT (Optional Practical Training)",
   "aka": ["Optional Practical Training"],
   "short": "OPT is temporary employment authorisation for F-1 students in work related to their major, granted for up to twelve months per education level by USCIS as an Employment Authorization Document, not by a school signature.",
   "body": [
    ("p", "OPT differs from CPT in the one way that governs all the planning around it: the authority is federal, not institutional. Your DSO recommends OPT in SEVIS and issues an I-20 reflecting the recommendation, but you then file Form I-765 with USCIS, and you may not work until the agency issues the card and the validity period on it has started. Processing takes as long as it takes, and it has been long enough in recent cycles that treating it as a formality is how people miss start dates."),
    ("p", "The allowance is <strong>up to twelve months at each higher education level</strong>, so a bachelor's degree and a later master's degree each carry their own allocation. It can be taken <strong>pre-completion</strong>, while you are still enrolled, or <strong>post-completion</strong>, after your program end date, and pre-completion use draws down the same twelve months, with part-time use counted at a reduced rate. Ask your DSO for the exact arithmetic on your record rather than estimating it, because the two forms are counted differently."),
    ("p", "Post-completion OPT carries an <strong>unemployment limit</strong>: a capped number of days you may spend not working during the authorisation period, after which the status consequences begin. The figure most commonly cited for standard post-completion OPT is ninety days. Treat that as a widely published number to verify against current government guidance rather than as something to plan tightly against, and understand that the count is aggregate across the period, not per gap."),
    ("p", "There are also application timing windows, both before and after the program end date, and a grace period after OPT ends during which you must depart, change status, or start a new program. All of these are dates on a calendar and all of them are unforgiving. The <a href=\"/visa.html\">visa timeline planner</a> exists to lay them out backwards from the day you would need to be working."),
   ],
   "example": "A student's degree ends in May and a job starts in July. The correct planning move is to file the I-765 in the earliest window the rules allow rather than after graduation, because the card, not the graduation date and not the offer letter, is what makes the July start legal. Filing late and hoping the processing is fast is how a start date becomes an offer withdrawal.",
   "misconception": "That a DSO's OPT recommendation is the authorisation. It is not. The recommendation is a prerequisite to the application. The card issued by USCIS, within the validity dates printed on it, is the authorisation, and a single day of work before the start date on that card is unauthorised employment.",
   "guide": ("/guides/cpt-vs-opt.html", "CPT vs OPT for F-1 students"),
   "see": ["cpt", "stem-opt", "dso", "h-1b"],
  },

  {
   "slug": "stem-opt",
   "term": "STEM OPT extension",
   "aka": ["STEM extension", "24-month OPT extension"],
   "short": "The STEM OPT extension is a twenty-four month extension of post-completion OPT available to graduates of qualifying STEM-designated degree programs, requiring an employer enrolled in E-Verify and a formal training plan on Form I-983.",
   "body": [
    ("p", "The extension exists to lengthen the runway between graduation and a longer-term classification, and for many students it is the difference between one shot at the H-1B registration and several. It adds twenty-four months to a standard twelve-month post-completion OPT period for people whose degree qualifies."),
    ("p", "Qualification runs off the degree, not the job. The degree program must appear on the government's list of STEM-designated fields, which is keyed to the classification code recorded for your program, and that code is on your I-20. Check the code rather than assuming, because programs with similar names can be coded differently at different institutions, and the code is what the adjudicator reads."),
    ("p", "Two employer-side requirements distinguish this from ordinary OPT. The employer must be <strong>enrolled in E-Verify</strong>, and the employer and student must complete a <strong>formal training plan on Form I-983</strong> describing the learning objectives, supervision and how the role relates to the degree. This is a real filter in practice: plenty of small companies and early-stage startups are not enrolled in E-Verify, and \"we will look into it\" is not the same as being enrolled by your filing date."),
    ("p", "The extension also brings ongoing obligations rather than a one-time approval: periodic validation reporting, self-evaluations against the training plan, and reporting of material changes such as a change of employer. Missing those is a status problem, not an administrative one. And the application itself has to be filed within the window before your current authorisation expires, so the planning starts months before the card runs out."),
   ],
   "example": "A graduate joins a twelve-person startup on standard post-completion OPT. Twelve months later the extension is the obvious next step, except the company is not in E-Verify and enrolling takes internal decisions nobody has made. The conversation that should have happened at the offer stage is happening with weeks left on the card.",
   "misconception": "That the extension depends on the job being technical. It depends on the degree being on the STEM-designated list and on the employment being related to it, with the employer meeting the E-Verify and training-plan requirements. A qualifying degree with a non-qualifying employer does not get the extension.",
   "guide": ("/guides/cpt-vs-opt.html", "CPT vs OPT for F-1 students"),
   "see": ["opt", "h-1b", "visa-sponsorship"],
  },

  {
   "slug": "i-539",
   "term": "Form I-539",
   "aka": ["Application To Extend/Change Nonimmigrant Status"],
   "short": "Form I-539 is the USCIS application used to extend or change nonimmigrant status from inside the United States, and an approval grants a new status without issuing a visa, because visas can only be issued abroad by a consulate.",
   "body": [
    ("p", "I-539 is how somebody already in the country in one nonimmigrant classification asks USCIS for a different one, or for more time in the current one, without leaving. A student changing into F-1 from a dependant classification would typically use it, as would dependants extending alongside a principal. Some employment classifications are requested by an employer on a different form instead, so the right form depends on which classification you are asking for and who is asking."),
    ("p", "The distinction that trips people is <strong>change of status versus visa issuance</strong>. An approved I-539 gives you the status. It does not give you a visa, because a visa is a consular product and consulates are abroad. So an approval lets you remain and act in the new classification, but the first time you leave the country you will need to apply for the corresponding visa at a consulate before returning, and that application is adjudicated on its own merits."),
    ("p", "Timing is the other trap. The application generally has to be filed while you are still in a period of authorised stay, and filing late is a discretionary problem rather than a technicality. Working or otherwise acting in the new classification before the approval is not permitted; the approval notice is the operative document, not the receipt."),
    ("p", "Departure while the application is pending has historically been treated as <strong>abandonment</strong> of the application, meaning you lose the filing rather than pausing it. This area has been subject to recent rule changes, so the interaction between a pending I-539 and any international travel is exactly the kind of question to put to an attorney with current knowledge before you book anything. Do not rely on what somebody who filed two years ago remembers."),
   ],
   "example": "Someone in the country in a dependant classification wants to enroll and hold F-1 status. They can file an I-539 to change status from inside the country, or they can leave and apply for an F-1 visa at a consulate and re-enter. Those are two different routes with different risks, different timelines, and different failure modes, and they are usually not compatible with each other as a hedge.",
   "misconception": "That an approved change of status also updates the passport, so travel is fine afterwards. It does not. The approval works only for staying in the country. Re-entry requires a visa in the new classification, obtained abroad, and a consular officer is not obliged to issue one just because USCIS approved the change.",
   "see": ["f-1-visa", "td-status", "unlawful-presence"],
  },

  {
   "slug": "unlawful-presence",
   "term": "Unlawful presence",
   "short": "Unlawful presence is time spent in the United States after the authorised period of stay has ended, or after a formal finding of a status violation, and it is a distinct concept from simply being out of status.",
   "body": [
    ("p", "The term has a specific statutory meaning and it is narrower than \"doing something wrong.\" You can violate the terms of your status, for example by working without authorisation, without necessarily accruing unlawful presence on the same day, because unlawful presence is about being present beyond an authorised period rather than about compliance in general. Both concepts can hurt you, but they hurt you through different mechanisms, and treating them as synonyms leads people to both false alarm and false comfort."),
    ("p", "The consequence structure is what makes it serious. Under widely published rules, accruing <strong>more than 180 days</strong> of unlawful presence and then departing the country can trigger a <strong>three-year bar</strong> on re-entry, and accruing <strong>one year or more</strong> and then departing can trigger a <strong>ten-year bar</strong>. There are further and harsher provisions for certain patterns of re-entry. The bars are triggered by the departure, which produces the counterintuitive result that leaving can be the act that creates the problem."),
    ("warn", "For students admitted for <strong>duration of status</strong>, when unlawful presence begins to accrue is a genuinely contested legal question, not a settled date rule. The long-standing agency interpretation was that accrual generally begins only after a formal finding of a status violation by USCIS in adjudicating a request, or by an immigration judge. A later policy change that would have started the clock on the day of the violation itself was challenged in federal court and set aside, and further rulemaking in this area has been proposed since. <strong>Anyone who tells you a clean date rule for a D/S student is oversimplifying something that courts and agencies have not agreed on.</strong> This is not a question to research; it is a question to take to a licensed immigration attorney with your actual record in front of them."),
    ("p", "The practical takeaway is about sequencing rather than arithmetic. If there is any possibility you are out of status or accruing unlawful presence, the order of operations is: get legal advice first, then decide about travel, then decide about filings. Departing to \"reset\" a problem is one of the most common and most costly instincts in this area, because departure is the event the bars attach to."),
   ],
   "misconception": "That being out of status and accruing unlawful presence are the same thing, and that the day counter starts automatically the moment something goes wrong. For duration-of-status students in particular, the start of accrual has been the subject of policy reversals and litigation. Do not plan around a bright-line date that no authority has actually settled.",
   "see": ["f-1-visa", "i-539", "td-status", "day-1-cpt"],
  },

  {
   "slug": "h-1b",
   "term": "H-1B",
   "short": "H-1B is a United States nonimmigrant classification for workers in a specialty occupation, petitioned for by an employer rather than requested by the worker, and subject to an annual numerical cap with a registration lottery for cap-subject petitions.",
   "body": [
    ("p", "A specialty occupation is one that requires the theoretical and practical application of a body of highly specialised knowledge, together with attainment of at least a bachelor's degree in the specific specialty as a normal minimum for entry into the occupation. That definition matters more than it looks: the question is not whether the person has a degree but whether the <em>role</em> normally requires one in a specific field, which is where a lot of petitions get questioned."),
    ("p", "The process is employer-driven end to end. The employer obtains a certified Labor Condition Application from the Department of Labor, attesting to wage and working-condition obligations, and then files a petition with USCIS. The worker is a beneficiary, not an applicant. This is the structural reason a candidate cannot fix a sponsorship problem through personal effort: the filing is not theirs to make."),
    ("p", "For cap-subject petitions there is an annual numerical limit, commonly published as sixty-five thousand with an additional twenty thousand reserved for beneficiaries holding a United States master's degree or higher. Because demand has exceeded supply for years, USCIS runs an electronic registration in the spring and selects registrations for the fiscal year beginning in October. Selection is a lottery outcome, not a merit outcome, and a strong candidate and a weak one have the same odds in it."),
    ("p", "For F-1 students the timing is the whole game. Post-completion OPT and the STEM extension are what give you multiple registration seasons instead of one, and there is a mechanism, commonly called cap-gap, that can extend F-1 status and work authorisation for students with a timely filed cap-subject petition awaiting an October start. The eligibility conditions for it are specific, so confirm them with your DSO in the same conversation where you plan the OPT dates."),
   ],
   "misconception": "That H-1B is applied for like a visa, by the person who wants it. It is not. It is petitioned for by an employer, it is capped, and for cap-subject petitions the first gate is a random selection. This is also why the answer to \"will you need sponsorship\" is about the employer's willingness to file, not about your qualifications.",
   "guide": ("/guides/swe-internship-international-student.html", "SWE internships as an international student"),
   "see": ["cap-exempt", "visa-sponsorship", "opt", "stem-opt"],
  },

  {
   "slug": "cap-exempt",
   "term": "Cap-exempt",
   "aka": ["H-1B cap-exempt"],
   "short": "Cap-exempt describes employers whose H-1B petitions are not counted against the annual numerical cap, a category that covers institutions of higher education, related or affiliated nonprofit entities, nonprofit research organisations and governmental research organisations.",
   "body": [
    ("p", "The exemption is written around a short list of employer types: an institution of higher education, a nonprofit entity related to or affiliated with such an institution, a nonprofit research organisation, and a governmental research organisation. The practical effect is that such an employer can file an H-1B petition at any time of year without entering the registration lottery, because the numerical limit does not apply to it."),
    ("p", "The critical structural point: <strong>the exemption attaches to the employer, not to the person.</strong> There is no such thing as a cap-exempt worker. You are exempt only for as long as you are employed by a qualifying employer in a qualifying capacity, and moving to an ordinary private company generally means becoming cap-subject and needing a selection like anyone else."),
    ("p", "This is why university research positions, teaching hospitals affiliated with medical schools, national laboratories and certain nonprofit research institutes occupy a distinct place in the planning of anyone tracking H-1B odds. It is not that these employers pay better or are easier to get into. It is that the lottery, which is the single largest source of randomness in the whole pathway, is not in the way."),
    ("p", "The boundaries are narrower than the summary suggests and are litigated at the edges. Whether a given nonprofit is genuinely \"related to or affiliated with\" a university, and whether a particular arrangement qualifies, are fact questions decided on the specific relationship. There are also arrangements involving concurrent employment between exempt and non-exempt employers that are technical and easy to get wrong. Treat this as a category to explore with an attorney and the employer's counsel, not as a checkbox on a job board."),
   ],
   "example": "A researcher holding H-1B through a university is cap-exempt while there. A private company offer two years later is cap-subject, which means an ordinary registration season and ordinary lottery odds. The exemption did not travel with the researcher; it belonged to the university.",
   "misconception": "That once you have had a cap-exempt H-1B you are permanently outside the cap. You are not. The exemption is a property of the employer and the position, and it ends when that employment does.",
   "guide": ("/guides/swe-internship-international-student.html", "SWE internships as an international student"),
   "see": ["h-1b", "visa-sponsorship"],
  },

  {
   "slug": "visa-sponsorship",
   "term": "Visa sponsorship",
   "short": "Visa sponsorship is an employer agreeing to file, and pay for, an immigration petition on a worker's behalf, which is an administrative and financial commitment by the company rather than something the worker can complete alone.",
   "body": [
    ("p", "Sponsorship means the company takes on the filing. For H-1B that means obtaining a certified Labor Condition Application, engaging counsel, paying government fees, and signing a petition that carries wage and record-keeping obligations, some of which the employer is legally required to bear and cannot pass to the worker. For a green-card sponsorship the commitment is considerably larger, longer and more expensive. That cost and administrative load, not prejudice, is the usual honest reason a small company says no."),
    ("p", "Now the part that costs students the most interviews they never applied for. <strong>\"We do not provide visa sponsorship\" on a job posting almost always refers to H-1B or permanent residency.</strong> It frequently does not mean the employer is unable to hire an F-1 student on CPT or OPT, because those authorisations are granted to the student and involve no petition, no filing fee and no counsel on the employer's side. Many postings carry the sentence as boilerplate copied from a template nobody has revisited."),
    ("p", "So the question to ask is specific rather than general. Not \"do you sponsor,\" which invites the boilerplate answer, but: \"I have work authorisation through OPT for this period and would not require a petition or any filing by the company. Is that within what the role can accommodate?\" That reframes it from a legal commitment to an administrative fact, and it is answerable by a recruiter without escalation."),
    ("p", "Two caveats to keep the framing honest. Some employers genuinely cannot hire anyone whose authorisation is temporary, for reasons ranging from federal contract requirements to internal policy, and no phrasing changes that. And the STEM OPT extension does impose a real employer obligation, namely E-Verify enrolment and the training plan, so a company that is fine with plain OPT may still be a dead end two years later. Ask about E-Verify early if the extension is part of your plan."),
   ],
   "example": "A posting says no sponsorship. The candidate applies anyway with one clear line in the message: authorised to work through post-completion OPT until a stated date, no petition or filing required from the company. Roughly speaking, this converts a category rejection into an ordinary hiring decision, which is the only outcome worth optimising for.",
   "misconception": "That \"no sponsorship\" is a legal statement about your eligibility. It is usually a statement about the company's willingness to file an H-1B petition, written before anyone considered CPT or OPT candidates. Verify what it means for your specific authorisation instead of self-rejecting on the boilerplate.",
   "guide": ("/guides/swe-internship-international-student.html", "SWE internships as an international student"),
   "see": ["h-1b", "cap-exempt", "opt", "stem-opt", "ats", "on-campus-recruiting"],
  },

 ],
}
