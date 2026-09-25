import { Fragment } from 'react';
import { Link, Typography } from '@mui/material';

const contactPattern = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}|(?<![\w/+.-])\+?\d[\d ().-]*\d(?![\w/])/gi;

const ContactText = ({ text }: { text: string }) => {
  const parts = [];
  let offset = 0;

  for (const match of text.matchAll(contactPattern)) {
    const value = match[0];
    const isEmail = value.includes('@');
    const digits = value.replace(/\D/g, '');
    const isDate = /^(?:\d{4}[-.]\d{1,2}[-.]\d{1,2}|\d{1,2}[-.]\d{1,2}[-.]\d{2,4})$/.test(value);

    if (!isEmail && (digits.length < 7 || digits.length > 15 || isDate)) continue;

    parts.push(text.slice(offset, match.index));
    parts.push(
      <Link
        key={match.index}
        color="inherit"
        href={isEmail ? `mailto:${value}` : `tel:${value.startsWith('+') ? '+' : ''}${digits}`}
        variant="inherit"
        underline="always"
      >
        {value}
      </Link>,
    );
    offset = match.index + value.length;
  }

  parts.push(text.slice(offset));
  return <>{parts}</>;
};

const EventDescription = ({ text }: { text: string }) => (
  <>
    {text.split(/(\r?\n)/).map((line, index) => {
      const field = /^(\s*(?:cliente|impianto)\s*:\s*)(.+)$/i.exec(line);

      return (
        <Fragment key={index}>
          {field ? (
            <>
              {field[1]}
              <Typography component="span" color="text.primary" fontWeight={700} variant="body2">
                <ContactText text={field[2] ?? ''} />
              </Typography>
            </>
          ) : (
            <ContactText text={line} />
          )}
        </Fragment>
      );
    })}
  </>
);

export default EventDescription;
