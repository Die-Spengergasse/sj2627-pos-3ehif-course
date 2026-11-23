export const CHAPTER_SLUGS = ['modern-java', 'streams', 'testing-design', 'reflection-db', 'rest'] as const;
export type ChapterSlug = (typeof CHAPTER_SLUGS)[number];

export type Chapter = {
	slug: ChapterSlug;
	title: string;
	/** Short label, e.g. "Chapter 1". */
	note: string;
};

/** The chapters, grouped by theme (topic blocks of the retrospective deck). */
export const CHAPTERS: readonly Chapter[] = [
	{ slug: 'modern-java', title: 'Modern Java', note: 'Chapter 1' },
	{ slug: 'streams', title: 'Streams & Functional', note: 'Chapter 2' },
	{ slug: 'testing-design', title: 'Testing & Design', note: 'Chapter 3' },
	{ slug: 'reflection-db', title: 'Reflection & Databases', note: 'Chapter 4' },
	{ slug: 'rest', title: 'REST & Architecture', note: 'Chapter 5' }
];

export const MODULE_SLUGS = [
	'modern-java-core',
	'enums',
	'singleton',
	'factory-method',
	'modern-java-extras',
	'streams-intro',
	'lambdas',
	'streams-intermediate',
	'collectors',
	'junit',
	'uml',
	'tdd',
	'good-code-style',
	'reflection',
	'annotations',
	'threading',
	'jdbc',
	'dao',
	'jpa-entities',
	'jpa-inheritance',
	'http-rest',
	'servlets',
	'dtos-validation',
	'front-controller',
	'servlets-in-depth',
	'dynamic-api'
] as const;
export type ModuleSlug = (typeof MODULE_SLUGS)[number];

export type Module = {
	slug: ModuleSlug;
	title: string;
	/** Chapter this module belongs to. */
	chapter: ChapterSlug;
	/** Folder of the matching slide deck under slides/POS/3xHIF/. Missing for modules without a deck. */
	deck?: string;
	/** Optional module: badge, and "Continue learning" only suggests it after all other core units. */
	bonus?: boolean;
	/** Announced but not written yet: listed as "coming soon", may not have units or questions. */
	placeholder?: boolean;
};

/**
 * The modules in course order. Deck 00 becomes the course info page; decks 07/08 (SOLID, a student
 * presentation task) and 34 (retrospective) are left out on purpose.
 */
export const MODULES: readonly Module[] = [
	{ slug: 'modern-java-core', title: 'var, Records, Optional & switch', chapter: 'modern-java', deck: '01_Var_Records_Optional_Switch' },
	{ slug: 'enums', title: 'Constants & Enums', chapter: 'modern-java', deck: '01a_Constants_Enum' },
	{ slug: 'singleton', title: 'Singleton', chapter: 'modern-java', deck: '01b_Singleton' },
	{ slug: 'factory-method', title: 'Factory Method', chapter: 'modern-java', deck: '01c_FactoryMethod' },
	{ slug: 'modern-java-extras', title: 'More Modern Java', chapter: 'modern-java', deck: '01d_Modern_Java_Additional_Features', bonus: true },
	{ slug: 'streams-intro', title: 'Streams: Intro', chapter: 'streams', deck: '02_Streams_Intro' },
	{ slug: 'lambdas', title: 'Lambdas & Method References', chapter: 'streams', deck: '02a_Lambda' },
	{ slug: 'streams-intermediate', title: 'Streams: filter, map, flatMap, reduce', chapter: 'streams', deck: '04_Streams_Intermediate' },
	{ slug: 'collectors', title: 'Collectors', chapter: 'streams', deck: '05_Streams_Collectors' },
	{ slug: 'junit', title: 'JUnit & AssertJ', chapter: 'testing-design', deck: '03_JUnit_Testing' },
	{ slug: 'uml', title: 'UML Class Diagrams', chapter: 'testing-design', deck: '04a_UML' },
	{ slug: 'tdd', title: 'TDD & FIRST', chapter: 'testing-design', deck: '06_TDD_FIRST' },
	{ slug: 'good-code-style', title: 'Good Code Style', chapter: 'testing-design' },
	{ slug: 'reflection', title: 'Reflection', chapter: 'reflection-db', deck: '09_Reflection' },
	{ slug: 'annotations', title: 'Annotations', chapter: 'reflection-db', deck: '10_Annotations' },
	{ slug: 'threading', title: 'Threading', chapter: 'reflection-db', placeholder: true },
	{ slug: 'jdbc', title: 'JDBC Basics', chapter: 'reflection-db', deck: '11_JDBC_Basics' },
	{ slug: 'dao', title: 'PreparedStatement & DAO', chapter: 'reflection-db', deck: '12_PreparedStatement_DAO' },
	{ slug: 'jpa-entities', title: 'JPA: Entities & Relationships', chapter: 'reflection-db', deck: '13_JPA_Entities_Relationships' },
	{ slug: 'jpa-inheritance', title: 'JPA: Inheritance & Value Objects', chapter: 'reflection-db', deck: '14_JPA_Inheritance_ValueObjects' },
	{ slug: 'http-rest', title: 'HTTP & REST', chapter: 'rest', deck: '15_HTTP_REST' },
	{ slug: 'servlets', title: 'Servlets: Basics', chapter: 'rest', deck: '16_Servlets_Basics' },
	{ slug: 'dtos-validation', title: 'DTOs & Validation', chapter: 'rest', deck: '17_DTOs_Validation' },
	{ slug: 'front-controller', title: 'REST with a Front Controller', chapter: 'rest', deck: '18_REST_Servlets_FrontController' },
	// Named after its content; the deck folder is called 19_Layered_Architecture.
	{ slug: 'servlets-in-depth', title: 'Servlets in Depth', chapter: 'rest', deck: '19_Layered_Architecture' },
	{ slug: 'dynamic-api', title: 'Dynamic API via Reflection', chapter: 'rest', deck: '20_DynamicAPI_Reflection' }
];

export function isModuleSlug(value: string): value is ModuleSlug {
	return (MODULE_SLUGS as readonly string[]).includes(value);
}

export function isChapterSlug(value: string): value is ChapterSlug {
	return (CHAPTER_SLUGS as readonly string[]).includes(value);
}

export function modulesOf(chapter: ChapterSlug): readonly Module[] {
	return MODULES.filter((m) => m.chapter === chapter);
}

export function moduleOf(slug: string): Module | undefined {
	return MODULES.find((m) => m.slug === slug);
}

/** Official slide decks, published from the teaching repository. */
export const SLIDES_BASE = 'https://mfreimueller.github.io/lectures/POS/3xHIF';

/** Link to the deck that belongs to a module. */
export function deckUrl(deck: string): string {
	return `${SLIDES_BASE}/${encodeURIComponent(deck)}/`;
}
