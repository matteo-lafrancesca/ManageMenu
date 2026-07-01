import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { normalizeCategory } from '@/types';

/**
 * GET /api/ingredients?search=...
 * Recherche des ingrédients enregistrés en base.
 */
export async function GET(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim() || '';

    const ingredients = await db.ingredient.findMany({
      where: {
        nom: {
          contains: search,
        },
      },
      take: 10, // Limite aux 10 premiers résultats
      orderBy: {
        nom: 'asc',
      },
    });

    return NextResponse.json(ingredients);
  } catch (error) {
    console.error('Erreur GET /api/ingredients:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

/**
 * POST /api/ingredients
 * Crée un nouvel ingrédient en base si celui-ci n'existe pas déjà.
 */
export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { nom, categorie } = body;

    if (!nom || typeof nom !== 'string' || nom.trim() === '') {
      return NextResponse.json({ error: "Le nom de l'ingrédient est obligatoire." }, { status: 400 });
    }

    if (!categorie || typeof categorie !== 'string' || categorie.trim() === '') {
      return NextResponse.json({ error: "La catégorie de l'ingrédient est obligatoire." }, { status: 400 });
    }

    const cleanNom = nom.trim();

    // Vérifier si l'ingrédient existe déjà
    const existing = await db.ingredient.findUnique({
      where: { nom: cleanNom },
    });

    if (existing) {
      return NextResponse.json(existing, { status: 200 });
    }

    const newIngredient = await db.ingredient.create({
      data: {
        nom: cleanNom,
        categorie: normalizeCategory(categorie),
      },
    });

    return NextResponse.json(newIngredient, { status: 201 });
  } catch (error) {
    console.error('Erreur POST /api/ingredients:', error);
    return NextResponse.json({ error: "Erreur lors de la création de l'ingrédient." }, { status: 500 });
  }
}
