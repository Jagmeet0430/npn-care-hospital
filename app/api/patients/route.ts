import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { data, error } = await supabase
      .from("patients")
      .insert({
        full_name: body.fullName,
        father_husband_name: body.fatherHusbandName,
        gender: body.gender,
        date_of_birth: body.dateOfBirth,
        age: body.age,
        mobile: body.mobile,
        email: body.email,
        address: body.address,
        city: body.city,
        state: body.state,
        pin_code: body.pinCode,
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      patient: data,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}