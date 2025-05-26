// Mineral types
export type MineralDisplayFieldset = {
    number: number;
    name: string;
    id: string;
    slug: string;
    photos: {
        photo: {
            name: string | null;
            image: string | null;
            imageBlurhash: string | null;
        };
    }[];
}

export type MineralFullFieldset = {
    number: number;
    name: string;
    id: string;
    slug: string;
    photos: {
        photo: {
            name: string | null;
            id: string;
            locality: {
                name: string;
            } | null;
            image: string | null;
            imageBlurhash: string | null;
            locality_fallback: string | null;
        };
    }[];
    associates: MineralDisplayFieldset[];
    associatedWith: MineralDisplayFieldset[];
    mineral_class: string;
    crystal_system: string;
    luster: string;
    chemical_formula: string;
    description: string;
    hardness_min: number;
    hardness_max: number;
    localities_description: string | null;
    uses: string | null;
}

// Locality types
export type LocalityDisplayFieldset = {
    number: number;
    name: string;
    latitude: number;
    longitude: number;
    id: string;
    slug: string;
    type: string;
    coordinates_known: boolean;
    photos: {
        name: string | null;
        image: string | null;
        imageBlurhash: string | null;
    }[];
};

export type LocalityFullFieldset = {
    minerals: {
        number: number;
        name: string;
        id: string;
        slug: string;
        photos: {
            photo: {
                name: string | null;
                image: string | null;
                imageBlurhash: string | null;
            };
        }[];
    }[];
    photos: {
        name: string | null;
        id: string;
        image: string | null;
        imageBlurhash: string | null;
        locality: {
            name: string;
        }
        locality_fallback: string | null;
    }[];
    id: string;
    slug: string;
    name: string;
    latitude: number;
    longitude: number;
    type: string;
    coordinates_known: boolean;
    description: string | null;
    createdAt: string;
    updatedAt: string;
}

// Photo types
export type PhotoDisplayFieldset = {
    number: number;
    name: string | null;
    id: string;
    locality: {
        name: string;
    } | null;
    image: string | null;
    imageBlurhash: string | null;
    locality_fallback: string | null;
}

export type PhotoFullFieldset = {
    number: number;
    name: string | null;
    id: string;
    locality: {
        name: string;
    } | null;
    image: string | null;
    imageBlurhash: string | null;
    description: string | null;
    locality_fallback: string | null;
    specimen_height: number | null;
    specimen_length: number | null;
    specimen_width: number | null;
    minerals: {
        mineral: {
            number: number;
            name: string;
            id: string;
            slug: string;
            photos: {
                photo: {
                    name: string | null;
                    image: string | null;
                    imageBlurhash: string | null;
                };
            }[];
        };
    }[];
}

// Article types
export type ArticleDisplayFieldset = {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    image: string | null;
    imageBlurhash: string | null;
    publishedAt: string | null;
    createdAt: string;
}

export type ArticleFullFieldset = {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    image: string | null;
    imageBlurhash: string | null;
    publishedAt: string | null;
    createdAt: string;
    content: string;
}