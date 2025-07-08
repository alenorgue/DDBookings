import mongoose from "mongoose";

// Definimos el esquema de Mongoose para el modelo de alojamiento
const accommodationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 100,
        trim: true
    },
    pricePerNight: {
        type: Number,
        required: true,
        min: 10,
        max: 100000,
    },
    squareMeters: {
        type: Number,
        required: true,
        min: 10,
        max: 1000,
    },
    mainPhoto: {
        type: String,
        required: true,
        match: /^https?:\/\/.+\.(jpg|jpeg|png|webp)$/i
    },
    mainPhotoLabel: {
        type: String,
        default: ''
    },
    photos: [{
        url: {
            type: String,
            required: true,
            match: /^https?:\/\/.+\.(jpg|jpeg|png|webp)$/i
        },
        label: {
            type: String,
            default: ''
        }
    }],
    description: {
        type: String,
        required: true,
        minlength: 30,
        maxlength: 2000,
        trim: true
    }, location: {
    address: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 200,
        trim: true
    },
    city: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 100,
        trim: true
    },
    country: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 100,
        trim: true
    },
    postalCode: {
        type: String,
        required: true,
        match: /^[A-Za-z0-9\- ]{3,12}$/
    }, 
    coordinates: {
  lat: {
    type: Number,
    required: true
  },
  lng: {
    type: Number,
    required: true
  }
}
},
    rooms: {
        type: Number,
        required: true,
        min: 1,
        max: 20
    },
    beds: {
        type: Number,
        required: true,
        min: 1,
        max: 40
    },
    maxGuests: {
        type: Number,
        required: true,
        min: 1,
        max: 40
    },
    bathrooms: {
        type: Number,
        required: true,
        min: 1,
        max: 20
    },
    propertyType: {
        type: String,
        required: true,
        enum: ['Apartment', 'House', 'Studio', 'Loft', 'Other']
    },
    amenities: [{
        type: String,
        enum: [
           'Adaptada para movilidad reducida', 'Wifi', 'Piscina', 'Plancha', 'Aire acondicionado', 'Calefacción', 'Cocina', 'Lavadora', 'Secadora', 'TV', 'Aparcamiento', 'Ascensor', 'Gimnasio', 'Terraza', 'Jardín', 'Cuna', 'Barbacoa', 'Chimenea', 'Lavavajillas', 'Microondas', 'Cafetera', 'Secador de pelo','Otros'
        ]
    }],
    petsAllowed: {
        type: Boolean,
        required: true
    },
    houseRules: {
        type: String,
        maxlength: 1000,
        trim: true
    },
    cancellationPolicy: {
        type: String,
        enum: ['Flexible', 'Moderate', 'Strict', 'Super Strict', 'No Refund'],
        default: 'Flexible'
    },
    checkIn: {
        type: String,
        match: /^([01]\d|2[0-3]):([0-5]\d)$/
    },
    checkOut: {
        type: String,
        match: /^([01]\d|2[0-3]):([0-5]\d)$/
    },
    hostId: { type: String, required: true },
    status: {
        type: String,
        enum: ['Available', 'Archived'],
        default: 'Available'
    },
    availability: {
  type: [Date], // Lista de fechas disponibles
  default: []
}
}, {
    timestamps: true
});

// Exportamos el modelo de mongoose
export default mongoose.model('Accommodation', accommodationSchema);