import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    organizer: {
      type: String,
      required: true,
    },

    speaker: {
      type: String,
    },

    category: {
      type: String,
      enum: [
        "Workshop",
        "Hackathon",
        "Seminar",
        "Bootcamp",
        "Conference",
        "Webinar",
      ],
      required: true,
    },

    mode: {
      type: String,
      enum: ["Online", "Offline", "Hybrid"],
      required: true,
    },

    location: {
      type: String,
      required: true,
    },

    eventDate: {
      type: Date,
      required: true,
    },

    registrationDeadline: {
      type: Date,
      required: true,
    },

    registrationLink: {
      type: String,
      default: "",
    },

    banner: {
      type: String,
    },

    price: {
      type: Number,
      default: 0,
    },

    totalSeats: {
      type: Number,
      default: 100,
    },

    seatsLeft: {
      type: Number,
      default: 100,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
    registrations: {
      type: [
        new mongoose.Schema(
          {
            student: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User",
              required: true,
            },
            registeredAt: {
              type: Date,
              default: Date.now,
            },
          },
          { _id: false }
        ),
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const Event = mongoose.model("Event", eventSchema);