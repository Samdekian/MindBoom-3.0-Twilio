
interface CopyrightProps {
  text: string;
}

const Copyright = ({ text }: CopyrightProps) => {
  return (
    <div className="border-t border-gray-200 mt-12 pt-8">
      <p className="text-center text-gray-500">
        © {new Date().getFullYear()} MindBloom Therapy. {text}
      </p>
    </div>
  );
};

export default Copyright;
