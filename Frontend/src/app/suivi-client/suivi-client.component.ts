import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CrudService } from '../service/crud.service';
import { Suivi } from '../Entites/Suivi.Entites';

@Component({
  selector: 'app-suivi-client',
  templateUrl: './suivi-client.component.html',
  styleUrls: ['./suivi-client.component.css']
})
export class SuiviClientComponent implements OnInit {

  suivis: Suivi[] = [];
  besoinId: number | null = null;
  userType: string | null = null;
  isLoading = true;
  error = false;
  selectedImage: string | null = null;
  selectedVideo: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: CrudService
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.userType = this.service.getCurrentUserType();

    // ✅ FIX 5: Fournisseurs must NOT use this component
    // Redirect them to their own suivi creation page
    if (this.userType === 'FOURNISSEUR') {
      this.router.navigate(['/listeBesoin']);
      return;
    }

    const besoinIdParam = this.route.snapshot.queryParamMap.get('besoinId');
    // ✅ FIX 2: parse to number, null if missing or 0
    this.besoinId = besoinIdParam ? Number(besoinIdParam) : null;

    const userId = this.getUserId(this.userType);
    if (!userId) {
      this.isLoading = false;
      this.error = true;
      return;
    }

    this.service.getSuivisByClientId(userId).subscribe({
      next: (data: Suivi[]) => {
        if (this.besoinId) {
          // ✅ FIX 2: strict Number() cast on BOTH sides — JSON ids can arrive as strings
          this.suivis = data.filter(s =>
            Number(s.reserver?.prixProposer?.besoin?.id) === Number(this.besoinId)
          );
        } else {
          this.suivis = data;
        }
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('❌ erreur suivi-client:', err);
        this.error = true;
        this.isLoading = false;
      }
    });
  }

  getUserId(userType: string | null): number | null {
    try {
      let token: string | null = null;
      if (userType === 'CLIENT')  token = sessionStorage.getItem('myTokenClient');
      if (userType === 'EXPERT')  token = sessionStorage.getItem('myTokenExpert');
      if (!token) return null;
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload?.data?.id ?? null;
    } catch {
      return null;
    }
  }

  fixUrl(url: string): string {
    if (!url) return '';
    return url.replace(
      'http://localhost:8081/uploads/',
      'http://localhost:8081/api/uploads/'
    );
  }

  isVideo(url: string): boolean {
    return url.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i) !== null;
  }

  openImage(url: string): void { this.selectedImage = url; }
  openVideo(url: string): void { this.selectedVideo = url; }
  closeModal(): void {
    this.selectedImage = null;
    this.selectedVideo = null;
  }

  goBack(): void {
    this.router.navigate(['/listeBesoin']);
  }
}