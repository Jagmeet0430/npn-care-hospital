"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarCheck, Send } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { doctors, treatments } from "@/lib/content";
import type { CmsContent } from "@/lib/cms";

const schema = z.object({
  name: z.string().min(2, "Enter patient name"),
  age: z.coerce.number().min(1, "Enter age").max(120, "Check age"),
  gender: z.string().min(1, "Select gender"),
  phone: z.string().min(10, "Enter phone number"),
  email: z.string().email("Enter valid email").optional().or(z.literal("")),
  treatment: z.string().min(1, "Select treatment"),
  doctor: z.string().min(1, "Select doctor"),
  date: z.string().min(1, "Choose date"),
  time: z.string().min(1, "Choose time")
});

type FormData = z.infer<typeof schema>;
type FormOptions = {
  doctors: Array<{ name: string }>;
  treatments: Array<{ slug: string; title: string }>;
};

export function AppointmentForm() {
  const [cmsOptions, setCmsOptions] = useState<FormOptions>({ doctors, treatments });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitSuccessful }
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      gender: "",
      treatment: "",
      doctor: "",
      time: ""
    }
  });

  useEffect(() => {
    fetch("/api/cms", { cache: "no-store" })
      .then((response) => response.json())
      .then((content: CmsContent) => setCmsOptions({ doctors: content.doctors, treatments: content.treatments }))
      .catch(() => undefined);
  }, []);

  async function onSubmit(data: FormData) {
    const response = await fetch("/api/appointments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      reset();
    }
  }

  return (
    <form className="appointment-form" onSubmit={handleSubmit(onSubmit)}>
      <div className="form-title">
        <CalendarCheck size={22} />
        <div>
          <h3>Book Appointment</h3>
          <p>Our care desk will call back to confirm your slot.</p>
        </div>
      </div>

      <label>
        Patient Name
        <input {...register("name")} placeholder="Full name" />
        {errors.name ? <span>{errors.name.message}</span> : null}
      </label>

      <div className="form-grid">
        <label>
          Age
          <input {...register("age")} type="number" placeholder="45" />
          {errors.age ? <span>{errors.age.message}</span> : null}
        </label>
        <label>
          Gender
          <select {...register("gender")}>
            <option value="">Select</option>
            <option>Female</option>
            <option>Male</option>
            <option>Other</option>
          </select>
          {errors.gender ? <span>{errors.gender.message}</span> : null}
        </label>
      </div>

      <div className="form-grid">
        <label>
          Phone
          <input {...register("phone")} placeholder="+91" />
          {errors.phone ? <span>{errors.phone.message}</span> : null}
        </label>
        <label>
          Email
          <input {...register("email")} placeholder="name@email.com" />
          {errors.email ? <span>{errors.email.message}</span> : null}
        </label>
      </div>

      <div className="form-grid">
        <label>
          Treatment
          <select {...register("treatment")}>
            <option value="">Select</option>
            {cmsOptions.treatments.map((item) => (
              <option key={item.slug}>{item.title}</option>
            ))}
          </select>
          {errors.treatment ? <span>{errors.treatment.message}</span> : null}
        </label>
        <label>
          Preferred Doctor
          <select {...register("doctor")}>
            <option value="">Select</option>
            {cmsOptions.doctors.map((doctor) => (
              <option key={doctor.name}>{doctor.name}</option>
            ))}
          </select>
          {errors.doctor ? <span>{errors.doctor.message}</span> : null}
        </label>
      </div>

      <div className="form-grid">
        <label>
          Preferred Date
          <input {...register("date")} type="date" />
          {errors.date ? <span>{errors.date.message}</span> : null}
        </label>
        <label>
          Preferred Time
          <select {...register("time")}>
            <option value="">Select</option>
            <option>Morning</option>
            <option>Afternoon</option>
            <option>Evening</option>
          </select>
          {errors.time ? <span>{errors.time.message}</span> : null}
        </label>
      </div>

      <button className="button button-primary form-submit" type="submit">
        <Send size={18} />
        Submit Request
      </button>
      {isSubmitSuccessful ? (
        <div className="success-box">
          <p className="success-note">Appointment request received. Our care desk will confirm by phone or WhatsApp.</p>
          <Link className="button button-quiet" href="/agreement">
            Complete Digital Agreement
          </Link>
        </div>
      ) : null}
    </form>
  );
}
