import axios from 'axios';

const PDFREST_API_KEY = import.meta.env.VITE_PDFREST_API_KEY || 'e9c51683-25a9-4b09-bf4d-e910c8d23c14';

export interface RedactionObject {
    type: 'literal' | 'regex' | 'preset';
    value: string;
}

export interface PdfRestResponse {
    inputId: string;
    outputId: string;
    outputUrl?: string;
}

class PdfRestService {
    private baseUrl = 'https://api.pdfrest.com';

    async previewRedact(file: File, redactions: RedactionObject[]): Promise<PdfRestResponse> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('redactions', JSON.stringify(redactions));
        formData.append('output', 'preview_redacted');

        const response = await axios.post<PdfRestResponse>(
            `${this.baseUrl}/pdf-with-redacted-text-preview`,
            formData,
            {
                headers: {
                    'Api-Key': PDFREST_API_KEY,
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        return response.data;
    }

    async applyRedaction(resourceId: string): Promise<PdfRestResponse> {
        const formData = new FormData();
        formData.append('id', resourceId);
        formData.append('output', 'permanently_redacted');

        const response = await axios.post<PdfRestResponse>(
            `${this.baseUrl}/pdf-with-redacted-text-applied`,
            formData,
            {
                headers: {
                    'Api-Key': PDFREST_API_KEY,
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        return response.data;
    }

    async getResourceBlob(resourceId: string): Promise<Blob> {
        const response = await axios.get(`${this.baseUrl}/resource/${resourceId}?format=file`, {
            headers: {
                'Api-Key': PDFREST_API_KEY,
            },
            responseType: 'blob',
        });

        return response.data;
    }

    async getResourceUrl(resourceId: string): Promise<string> {
        // format=url returns a JSON with the URL
        const response = await axios.get<{ url: string }>(`${this.baseUrl}/resource/${resourceId}?format=url`, {
            headers: {
                'Api-Key': PDFREST_API_KEY,
            },
        });

        return response.data.url;
    }
}

export const pdfRestService = new PdfRestService();
