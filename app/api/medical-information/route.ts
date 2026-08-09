import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { data, error } = await supabase
      .from("medical_information")
      .insert({
        patient_id: body.patientId,

        disease_problem: body.diseaseProblem,

        duration: body.duration,

        symptoms: body.symptoms,

        previous_treatment: body.previousTreatment,

        current_medicines: body.currentMedicines,

        medical_history: body.medicalHistory,

        allergies: body.allergies,

        doctor_preference: body.doctorPreference,
      })
      .select()
      .single();

    
    if (error) {
  console.error("Supabase Error:", error);

  return NextResponse.json(
    {
      success: false,
      error,
    },
    { status: 500 }
  );
}

    return NextResponse.json({
      success: true,
      medical: data,
    });

  } catch (err) {

    console.error(err);

    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}