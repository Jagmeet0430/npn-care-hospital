import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { data, error } = await supabase
      .from("treatment_details")
      .insert({
        patient_id: body.patientId,

        course_duration: body.courseDuration,

        recommended_therapy: body.recommendedTherapy,

        assigned_doctor: body.assignedDoctor,

        hospital_branch: body.hospitalBranch,
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
      treatment: data,
    });

  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}