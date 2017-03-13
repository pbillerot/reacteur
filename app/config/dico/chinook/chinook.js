import validator from 'validator'
import md5 from 'js-md5'
import randomstring from 'randomstring'
import moment from 'moment'
const { Tools } = require('../../Tools')

module.exports = {
    title: "CHINOOK",
    desc: "Chinook database is an alternative to the Northwind database, being ideal for demos and testing ORM tools.",
    group: null,
    limit: 60,
    tables: {
        Artist: {
            basename: '/home/billerot/conf/reacteur/Chinook_Sqlite.sqlite',
            key: 'ArtistId',
            elements: {
                ArtistId: {
                    label_long: "Artist Id",
                    label_short: "Artist Id",
                    type: "text",
                    is_read_only: true,
                },
                Name: {
                    label_long: "Artist name",
                    label_short: "Artist name",
                    type: "text",
                    placeholder: "name",
                    maxlength: 50,
                    is_valide(value, ctx) {
                        return !validator.isEmpty(value) && value.length > 1
                    },
                    error: "Required with 2 caracters minimum",
                },
                _albums: {
                    label_long: "Albums",
                    label_short: "Albums",
                    type: "view",
                    view: {
                        table: "Album",
                        view: "valbum",
                        where: "Album.ArtistId = $ArtistId"
                    }
                },
            },
            views: {
                vall: {
                    title: 'ARTISTS',
                    group: null,
                    form_add: 'fadd',
                    form_edit: 'fmaj',
                    form_delete: 'fmaj',
                    //where: "name like '%ac%'",
                    with_filter: true,
                    elements: {
                        ArtistId: {},
                        Name: {},
                    },
                }
            },
            forms: {
                fmaj: {
                    title: "ARTIST",
                    group: null,
                    elements: {
                        ArtistId: { is_hidden: true },
                        Name: { grid: [3, 6] },
                        _albums: { grid: [0, 12] },
                    },
                },
                fadd: {
                    title: "ARTIST",
                    group: null,
                    elements: {
                        ArtistId: { is_hidden: true },
                        Name: { grid: [3, 6] },
                    },
                }
            }
        },
        Album: {
            basename: '/home/billerot/conf/reacteur/Chinook_Sqlite.sqlite',
            key: 'AlbumId',
            elements: {
                AlbumId: {
                    label_long: "Album Id",
                    label_short: "Album Id",
                    type: "text",
                    is_read_only: true,
                },
                Title: {
                    label_long: "Title",
                    label_short: "Title of album",
                    type: "text",
                    placeholder: "title",
                    maxlength: 100,
                    is_valide(value, ctx) {
                        return !validator.isEmpty(value) && value.length > 1
                    },
                    error: "Required",
                },
                ArtistId: {
                    label_long: "Artist Id",
                    label_short: "Artist Id",
                    type: "select",
                    jointure: {
                        table: "Artist",
                        value: "ArtistId",
                        label: "Name"
                    },
                },
            },
            views: {
                vall: {
                    title: 'ALBUMS',
                    form_add: 'fmaj',
                    form_edit: 'fmaj',
                    form_delete: 'fmaj',
                    with_filter: true,
                    elements: {
                        ArtistId: {},
                        AlbumId: {},
                        Title: {},
                    }
                },
                valbum: {
                    title: 'ALBUMS',
                    form_add: 'fmaj',
                    form_edit: 'fmaj',
                    form_delete: 'fmaj',
                    is_hidden: true,
                    elements: {
                        AlbumId: {},
                        Title: {},
                    }
                }

            },
            forms: {
                fmaj: {
                    title: "ALBUM",
                    elements: {
                        ArtistId: {},
                        AlbumId: {},
                        Title: {},
                    },
                }
            }
        },
        MediaType: {
            basename: '/home/billerot/conf/reacteur/Chinook_Sqlite.sqlite',
            key: 'MediaTypeId',
            elements: {
                MediaTypeId: {
                    label_long: "MediaType Id",
                    label_short: "MediaType Id",
                    type: "text",
                    is_read_only: true,
                },
                Name: {
                    label_long: "Media Type",
                    label_short: "Media Type",
                    type: "text",
                    placeholder: "name",
                    maxlength: 50,
                    is_valide(value, ctx) {
                        return !validator.isEmpty(value) && value.length > 1
                    },
                    error: "Required with 2 caracters minimum",
                },
            },
            views: {
                vall: {
                    title: 'MEDIA TYPE',
                    group: null,
                    form_add: 'fmaj',
                    form_edit: 'fmaj',
                    form_delete: 'fmaj',
                    //where: "name like '%ac%'",
                    with_filter: true,
                    elements: {
                        MediaTypeId: {},
                        Name: {},
                    },
                }
            },
            forms: {
                fmaj: {
                    title: "MEDIA TYPE",
                    group: null,
                    elements: {
                        MediaTypeId: {},
                        Name: {},
                    },
                }
            }
        },
        Genre: {
            basename: '/home/billerot/conf/reacteur/Chinook_Sqlite.sqlite',
            key: 'GenreId',
            elements: {
                GenreId: {
                    label_long: "Genre",
                    label_short: "Genre",
                    type: "text",
                    is_read_only: true,
                },
                Name: {
                    label_long: "Genre",
                    label_short: "Genre",
                    type: "text",
                    placeholder: "name",
                    maxlength: 50,
                    is_valide(value, ctx) {
                        return !validator.isEmpty(value) && value.length > 1
                    },
                    error: "Required with 2 caracters minimum",
                },
            },
            views: {
                vall: {
                    title: 'GENRES',
                    group: null,
                    form_add: 'fmaj',
                    form_edit: 'fmaj',
                    form_delete: 'fmaj',
                    //where: "name like '%ac%'",
                    with_filter: true,
                    elements: {
                        GenreId: {},
                        Name: {},
                    },
                }
            },
            forms: {
                fmaj: {
                    title: "GENRES",
                    group: null,
                    elements: {
                        GenreId: {},
                        Name: {},
                    },
                }
            }
        },
        Track: {
            basename: '/home/billerot/conf/reacteur/Chinook_Sqlite.sqlite',
            key: 'TrackId',
            elements: {
                TrackId: {
                    label_long: "Track Id",
                    label_short: "Track Id",
                    type: "text",
                    is_read_only: true,
                },
                Name: {
                    label_long: "Track",
                    label_short: "Track",
                    type: "text",
                    placeholder: "track",
                    maxlength: 50,
                    is_valide(value, ctx) {
                        return !validator.isEmpty(value) && value.length > 1
                    },
                    error: "Required with 2 caracters minimum",
                },
                AlbumId: {
                    label_long: "Album",
                    label_short: "Album",
                    type: "select",
                    jointure: {
                        table: "Album",
                        value: "AlbumId",
                        label: "Title"
                    }
                },
                MediaTypeId: {
                    label_long: "Media",
                    label_short: "Media",
                    type: "select",
                    jointure: {
                        table: "MediaType",
                        value: "MediaTypeId",
                        label: "Name"
                    },
                },
                GenreId: {
                    label_long: "Genre",
                    label_short: "Genre",
                    type: "select",
                    jointure: {
                        table: "Genre",
                        value: "GenreId",
                        label: "Name"
                    },
                },
                Composer: {
                    label_long: "Composer",
                    label_short: "Composer",
                    type: "text",
                    placeholder: "composer",
                    maxlength: 100,
                    // is_valide(value, ctx) {
                    //     return !validator.isEmpty(value) && value.length > 1
                    // },
                    // error: "Required with 2 caracters minimum",
                },
                Milliseconds: {
                    label_long: "Duration",
                    label_short: "Duration",
                    type: "text",
                    placeholder: "duration",
                    maxlength: 10,
                    server_record: function (value) {
                        return value * 1000
                    },
                    // is_valide(value, ctx) {
                    //     return !validator.isEmpty(value) && value.length > 1
                    // },
                    // error: "Required with 2 caracters minimum",
                },
                Bytes: {
                    label_long: "Bytes",
                    label_short: "Bytes",
                    type: "text",
                    placeholder: "bytes",
                    pattern: "^[0-9]*$",
                    maxlength: 9,
                    is_valide(value, ctx) {
                        return validator.isInt(value.toString())
                    },
                    error: "not numeric",
                    title: "Seuls les chiffres sont acceptés",
                },
                UnitPrice: {
                    label_long: "Unit Price",
                    label_short: "Unit Price",
                    type: "text",
                    placeholder: "unit price",
                    pattern: "^[0-9]*(,|[\.]){0,1}[0-9]{0,2}$",
                    maxlength: 10,
                    is_valide(value, ctx) {
                        return validator.isCurrency(value.toString(),
                        {
                            allow_negatives: false, 
                            thousands_separator: ' ',
                        })
                    },
                    error: "not currency",
                },
            },
            views: {
                vall: {
                    title: 'TRACKS',
                    group: null,
                    form_add: 'fmaj',
                    form_edit: 'fmaj',
                    form_delete: 'fmaj',
                    //where: "name like '%ac%'",
                    with_filter: true,
                    elements: {
                        AlbumId: {},
                        TrackId: {},
                        Name: {},
                        MediaTypeId: {},
                        GenreId: {},
                        Composer: {},
                        Milliseconds: {},
                        Bytes: {},
                        UnitPrice: {},
                    },
                }
            },
            forms: {
                fmaj: {
                    title: "TRACK",
                    group: null,
                    elements: {
                        AlbumId: {},
                        TrackId: { is_hidden: true },
                        Name: {},
                        Composer: {},
                        MediaTypeId: { grid: [3, 4] },
                        GenreId: { grid: [3, 4] },
                        Milliseconds: { grid: [3, 2] },
                        Bytes: { grid: [3, 2] },
                        UnitPrice: { grid: [3, 2] },
                    },
                }
            }
        },
    }
}
