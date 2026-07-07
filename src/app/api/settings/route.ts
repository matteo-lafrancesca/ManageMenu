import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

/**
 * GET /api/settings
 * Retourne les préférences de l'utilisateur connecté.
 */
export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json(
        { error: 'Non autorisé. Veuillez vous connecter.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      weekStartDay: sessionUser.weekStartDay,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des paramètres:', error);
    return NextResponse.json(
      { error: 'Une erreur interne est survenue.' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/settings
 * Met à jour les préférences de l'utilisateur connecté.
 * Payload: { weekStartDay?: number }
 */
export async function PATCH(request: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json(
        { error: 'Non autorisé. Veuillez vous connecter.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { weekStartDay } = body;

    if (weekStartDay !== undefined) {
      if (
        typeof weekStartDay !== 'number' ||
        !Number.isInteger(weekStartDay) ||
        weekStartDay < 0 ||
        weekStartDay > 6
      ) {
        return NextResponse.json(
          { error: 'weekStartDay doit être un entier entre 0 (Lundi) et 6 (Dimanche).' },
          { status: 400 }
        );
      }
    }

    const updated = await db.user.update({
      where: { id: sessionUser.id },
      data: {
        ...(weekStartDay !== undefined && { weekStartDay }),
      },
      select: {
        weekStartDay: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Erreur lors de la mise à jour des paramètres:', error);
    return NextResponse.json(
      { error: 'Une erreur interne est survenue.' },
      { status: 500 }
    );
  }
}
