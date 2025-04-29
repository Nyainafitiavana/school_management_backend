import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';

class Helper {
  public async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  public calculateOffset = async (
    limit: number,
    page: number,
  ): Promise<number> => {
    return limit * (page - 1);
  };

  public getDateNowString = async (): Promise<string> => {
    const date: Date = new Date();
    const year: string = date.toLocaleString('default', { year: 'numeric' });
    const month: string = date.toLocaleString('default', { month: '2-digit' });
    const day: string = date.toLocaleString('default', { day: '2-digit' });

    return year + '-' + month + '-' + day;
  };

  public getYear = async (): Promise<string> => {
    const date: Date = new Date();
    return date.toLocaleString('default', { year: 'numeric' });
  };

  public getMonth = async (): Promise<string> => {
    const date: Date = new Date();
    return date.toLocaleString('default', { month: '2-digit' });
  };

  public getDay = async (): Promise<string> => {
    const date: Date = new Date();
    return date.toLocaleString('default', { day: '2-digit' });
  };

  public generateUuid = async (): Promise<string> => {
    return uuidv4();
  };

  public formatDateString = (
    dateString: string,
    format: 'ENG' | 'FR',
    longFormat: boolean = false,
  ): string => {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      throw new Error('Invalid date string');
    }

    let formattedDate: string;

    if (longFormat) {
      // Long format with official formats
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: '2-digit',
      };
      formattedDate =
        format === 'ENG'
          ? date.toLocaleDateString('en-US', options) // e.g., "September 03, 2024"
          : date.toLocaleDateString('fr-FR', options); // e.g., "03 septembre 2024"
    } else {
      // Short format with official formats
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      };
      formattedDate =
        format === 'ENG'
          ? date.toLocaleDateString('en-US', options) // e.g., "09/03/2024"
          : date.toLocaleDateString('fr-FR', options); // e.g., "03/09/2024"
    }

    return formattedDate;
  };

  public formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  public ticketPdfTemplate = async (): Promise<string> => {
    return `
        <style>
          body {
              width: 80mm; /* Set width to match your PDF width */
              height: 200mm;
              font-family: Arial, "Roboto Light",serif;
              font-size: 12px;
              margin: 3px;
              padding: 0;
              overflow: hidden; /* Prevent overflow */
          }
          .head-invoice {
            font-size: 10px;
          }
          .separate {
              width: 30px;
          }
          .invoice-title {
              font-weight: 600;
          }
          .invoice-number {
              margin-left: 5px;
          }
          .company-name, .invoice-date {
              font-weight: 600;
          }
    
          .product-list-table {
              margin-top: 10px;
              width: 99%;
              font-size: 11px;
          }
    
          .product-list-table, .product-list-table th, .product-list-table td {
              border: 1px solid black;
              border-collapse: collapse;
          }
          .body-list {
            font-size: 9px;
          }
          .price {
              text-align: right;
          }
          .qt {
              text-align: center;
          }
          .total {
              margin-top: 5px;
              font-size: 10px;
          }
          .legend {
              margin-top: 5px;
              font-size: 9px;
          }
          
        </style>
        <body>
           
        </body>
    `;
  };

  public a4PdfTemplate = async (): Promise<string> => {
    return `
        <style>
          body {
              font-family: Arial, "Roboto Light",serif;
              font-size: 12px;
              margin: 3px;
              padding: 0;
              overflow: hidden; /* Prevent overflow */
          }
          .head-invoice {
            font-size: 10px;
          }
          .separate {
              width: 30px;
          }
          .invoice-title {
              font-weight: 600;
          }
          .invoice-number {
              margin-left: 5px;
          }
          .company-name, .invoice-date {
              font-weight: 600;
          }
    
          .product-list-table {
              margin-top: 10px;
              width: 99%;
              font-size: 11px;
          }
    
          .product-list-table, .product-list-table th, .product-list-table td {
              border: 1px solid black;
              border-collapse: collapse;
          }
          .body-list {
            font-size: 9px;
          }
          .price {
              text-align: right;
          }
          .qt {
              text-align: center;
          }
          .total {
              margin-top: 5px;
              font-size: 10px;
          }
          .legend {
              margin-top: 5px;
              font-size: 9px;
          }
          
        </style>
        <body>
        </body>
    `;
  };
}
export default Helper;
