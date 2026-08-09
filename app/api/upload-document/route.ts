import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const patientId = formData.get("patientId") as string;
    const documentType = formData.get("documentType") as string;
    const file = formData.get("file") as File;

    if (!patientId || !documentType || !file) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
        },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filePath = `${patientId}/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("patient-documents")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error(uploadError);

      return NextResponse.json(
        {
          success: false,
          error: uploadError.message,
        },
        { status: 500 }
      );
    }

    const { data, error } = await supabase
      .from("uploaded_documents")
      .insert({
        patient_id: patientId,

        document_type: documentType,

        file_name: file.name,

        file_path: filePath,

        file_size: file.size,

        mime_type: file.type,
      })
      .select()
      .single();

    if (error) {
      console.error(error);

      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      document: data,
    });

  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}