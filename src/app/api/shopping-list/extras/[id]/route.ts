import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

/**
 * DELETE /api/shopping-list/extras/[id]
 * Supprime un repas ou un ingrédient hors-planning de la liste de courses.
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const extraId = parseInt(id, 10);
    if (isNaN(extraId)) {
      return NextResponse.json(
        { error: 'L\'identifiant de l\'article doit être un nombre valide.' },
        { status: 400 }
      );
    }

    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json(
        { error: 'Non autorisé. Veuillez vous connecter.' },
        { status: 401 }
      );
    }

    // Récupérer l'élément existant pour valider la possession
    const existingExtra = await db.shoppingListExtra.findUnique({
      where: { id: extraId },
    });

    if (!existingExtra) {
      return NextResponse.json(
        { error: 'L\'article spécifié est introuvable.' },
        { status: 404 }
      );
    }

    if (existingExtra.userId !== sessionUser.id) {
      return NextResponse.json(
        { error: 'Vous n\'êtes pas autorisé à supprimer cet article.' },
        { status: 403 }
      );
    }

    // Supprimer l'élément
    await db.shoppingListExtra.delete({
      where: { id: extraId },
    });

    return NextResponse.json({ message: 'Article supprimé avec succès.' }, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'extra de course:', error);
    return NextResponse.json(
      { error: 'Une erreur interne est survenue lors de la suppression.' },
      { status: 500 }
    );
  }
}
