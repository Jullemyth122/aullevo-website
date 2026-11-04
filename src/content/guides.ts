// Long-form guides published at /guides/<slug>. Each is pre-rendered to static HTML at build time
// (scripts/build-policy-pages.mjs), so readers and search crawlers get the full text without JavaScript.

export type GuideBlock =
    | { type: 'p'; text: string }
    | { type: 'h2'; text: string }
    | { type: 'ul'; items: string[] }
    | { type: 'ol'; items: string[] }
    | { type: 'tip'; text: string };

export interface Guide {
    slug: string;
    title: string;
    description: string;
    published: string; // ISO date
    readMinutes: number;
    body: GuideBlock[];
}

export const GUIDES: Guide[] = [
    {
        slug: 'fill-workday-applications-faster',
        title: 'How to fill out Workday job applications faster without losing accuracy',
        description: 'Why Workday applications take so long, what to prepare before you start, and a repeatable routine that cuts each application down to a few minutes.',
        published: '2026-11-04',
        readMinutes: 7,
        body: [
            { type: 'p', text: 'Workday is one of the most common applicant tracking systems in the world, used by thousands of large employers. If you are job hunting, you will probably fill out dozens of Workday applications, and each one asks for the same information in slightly different ways: contact details, work history, education, voluntary disclosures, and a resume upload. Done by hand, a single application can take 20 to 40 minutes.' },
            { type: 'p', text: 'The good news is that most of that time goes into retyping information you already have. With a little preparation, you can spend your time on the parts that actually matter, like tailoring your resume and answering role-specific questions.' },
            { type: 'h2', text: 'Why Workday applications feel so slow' },
            { type: 'ul', items: [
                'Every employer runs its own Workday tenant, so you usually need a new account for each company.',
                'Applications are split across five to eight pages (My Information, My Experience, Application Questions, Voluntary Disclosures, Self Identify, Review), and each page validates before you can continue.',
                'Work history and education are entered as repeating blocks with separate fields for title, company, location, dates, and description.',
                'Dropdowns often use custom components instead of standard select boxes, so browser autofill does not recognise them.',
                'Uploading a resume sometimes pre-fills your work history, but the parsed result is frequently wrong and needs correcting line by line.',
            ] },
            { type: 'h2', text: 'Prepare once: your application master file' },
            { type: 'p', text: 'Before you apply anywhere, write down every answer you will need in one place. A plain document is enough. Include:' },
            { type: 'ul', items: [
                'Your legal name, preferred name, phone number in international format, email, and full address.',
                'Links you want to share: LinkedIn, portfolio, GitHub, or personal site.',
                'Each job with exact title, employer, city, start and end month, and a three-to-five line description of what you did.',
                'Each school with degree, field of study, and graduation date.',
                'Standard answers: work authorization, need for sponsorship, notice period, willingness to relocate, and salary expectations as a range.',
                'Your resume and cover letter saved as PDFs with clear file names, such as Firstname-Lastname-Resume.pdf.',
            ] },
            { type: 'tip', text: 'Write your descriptions in the same tense and style you use on your resume. Recruiters often compare the two, and consistent wording looks careful.' },
            { type: 'h2', text: 'A routine for each application' },
            { type: 'ol', items: [
                'Read the job posting first and note two or three requirements you clearly meet. You will use them in any free-text questions.',
                'Create the employer account with a password manager so you can return to the application later.',
                'Skip the "autofill with resume" option if past parsing results were poor; filling from your master file is usually faster than correcting a bad parse.',
                'Fill the repeating work history and education blocks from your master file, starting with your most recent role.',
                'Answer the application questions honestly and consistently. Inconsistent answers about authorization or relocation are a common reason applications are filtered out.',
                'Use the Review page. Check dates, the spelling of employer names, and that the correct resume version is attached.',
            ] },
            { type: 'h2', text: 'Where a form-filling extension helps' },
            { type: 'p', text: 'A form filler stores your master file as a structured profile and types it into the page for you. Aullevo, for example, matches each Workday field to your saved profile, including custom dropdowns, radio buttons, date pickers, and repeating experience blocks, and fills the page with one shortcut. On multi-page applications it can move to the next page after filling, and it pauses when a required field is empty so you can answer it yourself.' },
            { type: 'p', text: 'Whatever tool you use, keep yourself in the loop. Automation is best at the repetitive parts, such as names, addresses, dates, and standard yes/no questions. You should still write or review answers to role-specific questions and confirm everything on the Review page before submitting.' },
            { type: 'h2', text: 'Common mistakes to avoid' },
            { type: 'ul', items: [
                'Submitting with an outdated resume attached. Rename files by date or version so you can tell them apart.',
                'Leaving optional cover letter fields empty for roles you care about most. A short, specific paragraph is better than nothing.',
                'Using different phone numbers or email addresses across applications, which makes recruiter follow-up harder.',
                'Rushing voluntary disclosure pages. You can choose not to answer these questions, but pick that option deliberately.',
            ] },
            { type: 'p', text: 'Treat every application as something a person will read. Speed is useful only if the result is accurate and reflects you well.' },
        ],
    },
    {
        slug: 'autofill-safety-government-tax-forms',
        title: 'Is it safe to use an autofill extension for government and tax forms?',
        description: 'What actually happens to your data when an extension fills a form, the questions to ask before trusting one, and which fields you should always type yourself.',
        published: '2026-11-04',
        readMinutes: 6,
        body: [
            { type: 'p', text: 'Government, tax, and benefits forms ask for some of the most sensitive information you have: identification numbers, income, bank details, and family information. It is reasonable to ask whether any browser extension should be allowed near them. The answer depends less on the idea of autofill and more on how a particular tool stores and handles your data.' },
            { type: 'h2', text: 'What an extension can see' },
            { type: 'p', text: 'To fill a form, an extension needs permission to read and change the pages you visit. That permission is powerful: in principle, an extension with it can read anything on those pages. This is why the trustworthiness of the developer and the design of the tool matter so much.' },
            { type: 'h2', text: 'Five questions to ask before trusting a form filler' },
            { type: 'ol', items: [
                'Where is my data stored? The safest answer is "only on your device", encrypted, rather than on the developer\'s servers.',
                'Is the stored data encrypted? Look for a named standard such as AES-256-GCM rather than vague promises.',
                'Does anything leave my browser? If the tool uses AI, find out exactly which fields are sent, to whom, and whether you can exclude some.',
                'Can I read the privacy policy in plain language? A good policy explains data flows clearly and names third parties.',
                'Is the developer reachable? A real contact address and a history of updates are good signs.',
            ] },
            { type: 'h2', text: 'How Aullevo handles this' },
            { type: 'p', text: 'Aullevo stores profiles in your browser, encrypted with AES-256-GCM, and does not upload them to Aullevo servers. Its offline matching engine fills standard fields without any network request. AI Smart Fill is optional and uses an AI provider you choose with your own API key; requests go directly from your browser to that provider. Each field can be marked SENSITIVE, and sensitive values are never sent to any AI provider.' },
            { type: 'h2', text: 'Fields you should always handle yourself' },
            { type: 'p', text: 'Even with a careful tool, some information deserves manual entry and a second look:' },
            { type: 'ul', items: [
                'National ID, social security, or tax identification numbers.',
                'Bank account and routing numbers for refunds or benefit payments.',
                'Signatures, declarations, and any checkbox that confirms information is true under penalty of law.',
                'Income figures and dates that change from year to year.',
            ] },
            { type: 'tip', text: 'A practical split: let the tool fill names, addresses, contact details, and household members, then type identification and financial numbers yourself and read the whole form before submitting.' },
            { type: 'h2', text: 'General safety habits' },
            { type: 'ul', items: [
                'Only fill official forms on the official government domain. Check the address bar before entering anything.',
                'Keep your browser and extensions updated, and remove extensions you no longer use.',
                'Save or print a confirmation page after submitting, so you have a record if something goes wrong.',
                'Use a device you control. Avoid shared or public computers for sensitive forms.',
            ] },
            { type: 'p', text: 'Autofill can make bureaucratic forms far less tedious, but you remain responsible for what you submit. Choose tools that keep your data on your device, and keep a human review step before anything official is sent.' },
        ],
    },
    {
        slug: 'browser-autofill-vs-form-filler-extension',
        title: 'Browser autofill vs. a form-filler extension: what is the difference?',
        description: 'Chrome, Edge, and password managers already fill some fields. Here is what they handle well, where they stop, and when a dedicated form filler is worth it.',
        published: '2026-11-04',
        readMinutes: 5,
        body: [
            { type: 'p', text: 'Every modern browser can remember your name, email, phone number, address, and payment cards. Password managers add logins and sometimes identity details. For many everyday forms, that is enough. So when does a dedicated form-filler extension make sense?' },
            { type: 'h2', text: 'What built-in browser autofill does well' },
            { type: 'ul', items: [
                'Checkout pages: shipping address, contact details, and saved cards.',
                'Sign-up forms with standard fields marked up using the autocomplete attribute.',
                'Logins, through the browser\'s password manager.',
            ] },
            { type: 'p', text: 'Browser autofill relies heavily on websites labelling their fields with standard autocomplete names such as given-name or postal-code. When a site does this, autofill is fast and reliable.' },
            { type: 'h2', text: 'Where browser autofill stops' },
            { type: 'ul', items: [
                'Custom questions such as "Why do you want to work here?" or "Years of experience with Python".',
                'Dropdowns, radio buttons, and checkboxes built from custom components rather than standard form elements.',
                'Repeating sections like work history, education, or dependants.',
                'Fields inside Shadow DOM components or embedded frames, common in modern application portals.',
                'File uploads such as a resume, transcript, or ID document.',
                'Multiple identities, for example separate profiles for job applications, school forms, and work paperwork.',
            ] },
            { type: 'h2', text: 'What a form-filler extension adds' },
            { type: 'p', text: 'A form filler reads the label and context of each field instead of depending only on autocomplete names. That lets it fill custom questions from answers you saved, choose the right option in dropdowns and radio groups, and work inside components that browser autofill cannot reach. Aullevo, for instance, matches fields to profiles you control, works across Shadow DOM and iframes, attaches saved documents to upload fields, and can optionally use an AI model you choose for questions it has not seen before.' },
            { type: 'h2', text: 'How to decide' },
            { type: 'ul', items: [
                'If you mostly shop online and sign up for services, built-in autofill and a password manager are enough.',
                'If you fill long, repetitive forms (job applications, HR onboarding, school surveys, or recurring paperwork), a form filler saves real time.',
                'If privacy is your main concern, prefer tools that store profiles encrypted on your device and let you control what, if anything, is sent to an AI provider.',
            ] },
            { type: 'tip', text: 'You can use both. Let the browser handle logins and payments, and use a form filler for long forms with custom questions.' },
        ],
    },
    {
        slug: 'reusable-application-profile-from-resume',
        title: 'How to turn your resume into a reusable application profile',
        description: 'A step-by-step method for converting your resume into structured, reusable answers, including a prompt you can give any AI chatbot.',
        published: '2026-11-04',
        readMinutes: 6,
        body: [
            { type: 'p', text: 'A resume is written for people: it is compact, formatted, and selective. Application forms want the same information broken into separate fields. Converting your resume into a structured profile once saves you from retyping it into every form, and it forces you to fix inconsistencies you might not have noticed.' },
            { type: 'h2', text: 'Step 1: collect the facts' },
            { type: 'p', text: 'Start from your most recent resume and add anything forms ask for that resumes usually leave out:' },
            { type: 'ul', items: [
                'Exact start and end months for each role and school.',
                'Employer locations (city and country).',
                'Manager or reference contacts, if you are comfortable sharing them.',
                'Certifications with issuing body and date.',
                'Languages and proficiency levels.',
            ] },
            { type: 'h2', text: 'Step 2: structure it' },
            { type: 'p', text: 'Group the information into sections that match how forms ask for it: personal details, contact, links, work experience, education, skills, and standard questions. Keep one entry per job and per school, with the same fields each time.' },
            { type: 'h2', text: 'Step 3: let an AI chatbot do the tedious part' },
            { type: 'p', text: 'You can paste your resume into any AI chatbot and ask it to produce structured data. A prompt that works well:' },
            { type: 'tip', text: '"Convert the resume below into JSON with sections for personal details, contact, links, work experience (title, company, location, start date, end date, description), education (school, degree, field, graduation date), and skills. Use only information from the resume. Leave fields empty when the resume does not say."' },
            { type: 'p', text: 'Always check the result. Chatbots sometimes invent dates or merge two roles. The instruction to use only information from the resume reduces this, but it does not remove the need to review.' },
            { type: 'p', text: 'Aullevo\'s JSON quick setup is built around this workflow: it gives you a ready-made prompt, you paste your resume into the chatbot of your choice, and you import the result as a profile. Your resume is shared only with the chatbot you choose, never with Aullevo.' },
            { type: 'h2', text: 'Step 4: write your standard answers' },
            { type: 'p', text: 'Many forms ask the same open questions. Write short, honest answers once and adapt them per application:' },
            { type: 'ul', items: [
                'A two-sentence professional summary.',
                'Why you are looking for a new role.',
                'Your availability and notice period.',
                'Salary expectations as a range, with currency.',
            ] },
            { type: 'h2', text: 'Step 5: keep it current' },
            { type: 'p', text: 'Update the profile whenever you update your resume. Keep a backup file of the profile so you can restore it on a new device, and delete old versions you no longer use.' },
        ],
    },
    {
        slug: 'online-application-checklist',
        title: 'A checklist to run before you submit any online application',
        description: 'Ten quick checks that catch the most common mistakes in job, school, and government applications, whether you filled the form by hand or with a tool.',
        published: '2026-11-04',
        readMinutes: 4,
        body: [
            { type: 'p', text: 'Most application mistakes are small: a wrong date, an old file, a typo in an email address. They are also the easiest to prevent. Run through this list before pressing Submit, especially when you filled the form quickly or with an autofill tool.' },
            { type: 'ol', items: [
                'Your name matches your official documents exactly, including middle names and accents where required.',
                'Your email address and phone number are correct. Send yourself a test message if you are unsure.',
                'Dates are in the format the form expects (day/month versus month/day) and are consistent with your resume.',
                'Employer and school names are spelled correctly and not abbreviated unless the form asks for it.',
                'The right document is attached: the current resume, the cover letter for this specific organisation, the correct ID page.',
                'Every required question has an answer, and "Prefer not to say" options were chosen deliberately.',
                'Free-text answers mention the specific organisation or programme, not a different one you applied to earlier.',
                'Yes/no eligibility questions (work authorisation, sponsorship, age, residency) are answered truthfully and consistently.',
                'You have read any declaration or consent text before ticking the box.',
                'You saved or screenshotted the confirmation page and noted any reference number.',
            ] },
            { type: 'h2', text: 'If you used an autofill tool' },
            { type: 'p', text: 'Autofill tools, including Aullevo, are designed to fill fields from information you saved, but no tool can know whether a saved answer is still right for this particular form. Look out for answers that were correct last month but not today, such as your current employer, notice period, or address.' },
            { type: 'tip', text: 'Turn off automatic submission for forms you want to review line by line, and use the review page that most portals provide.' },
            { type: 'h2', text: 'After you submit' },
            { type: 'ul', items: [
                'Check your inbox (and spam folder) for a confirmation email.',
                'Keep a simple tracker with the organisation, role or programme, date submitted, and reference number.',
                'Set a reminder to follow up if the posting gives a decision timeline.',
            ] },
        ],
    },
];

export const findGuide = (slug: string | undefined) => GUIDES.find(g => g.slug === slug);
