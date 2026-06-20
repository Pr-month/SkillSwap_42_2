import style from "./text-link.module.css";

export type TTextLinkProps = {
  children: React.ReactNode;
} & React.ComponentPropsWithoutRef<"a">;

export const TextLink = ({ children, className, ...props }: TTextLinkProps) => {
  return (
    <a className={`${style.text_link} ${className ?? ""}`} {...props}>
      {children}
    </a>
  );
};
