
import { useLanguage } from "@/contexts/LanguageContext";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Timeline, TimelineItem, TimelineSeparator, TimelineDot, TimelineConnector, TimelineContent } from "@/components/HipaaTimeline";

const HipaaPrivacy = () => {
  const { t, language } = useLanguage();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">{t("hipaaPrivacyTitle")}</h1>
          
          <div className="prose prose-lg max-w-none">
            {language === "pt-BR" ? (
              <>
                <h2 className="text-2xl font-semibold mt-8 mb-4">Práticas de Privacidade HIPAA – MindBloom</h2>
                <p className="mb-4">
                  Última atualização: 16 de Abril de 2025
                </p>
                
                <h3 className="text-xl font-semibold mt-6 mb-3">1. Nossa Conformidade com a HIPAA</h3>
                <p className="mb-4">
                  A MindBloom está comprometida em cumprir os requisitos da Lei de Portabilidade e Responsabilidade de Seguros de Saúde (HIPAA) dos EUA. 
                  Como uma entidade que lida com informações de saúde protegidas (PHI), implementamos medidas rigorosas para garantir a 
                  confidencialidade, integridade e disponibilidade de suas informações de saúde mental.
                </p>
                
                <h3 className="text-xl font-semibold mt-6 mb-3">2. Informações de Saúde Protegidas (PHI)</h3>
                <p className="mb-4">
                  Consideramos todas as informações relacionadas à sua saúde mental compartilhadas em nossa plataforma como PHI, incluindo:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Histórico de conversas com nossa IA</li>
                  <li>Notas e registros de sessões com terapeutas</li>
                  <li>Informações sobre seu estado emocional e mental</li>
                  <li>Quaisquer diagnósticos ou tratamentos discutidos</li>
                </ul>
                
                <h3 className="text-xl font-semibold mt-6 mb-3">3. Medidas de Segurança Técnicas</h3>
                <p className="mb-4">
                  Implementamos as seguintes medidas para proteger suas informações:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Criptografia de dados em trânsito (TLS/SSL) e em repouso (AES-256)</li>
                  <li>Autenticação multifator para acesso a contas</li>
                  <li>Logs detalhados de auditoria para todas as atividades relacionadas ao PHI</li>
                  <li>Controles de acesso baseados em funções para limitar o acesso a dados sensíveis</li>
                  <li>Backups criptografados e procedimentos de recuperação de desastres</li>
                </ul>
                
                <h3 className="text-xl font-semibold mt-6 mb-3">4. Direitos do Paciente sob a HIPAA</h3>
                <p className="mb-4">
                  Como nosso usuário, você tem os seguintes direitos sobre suas informações:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Direito de acesso às suas informações de saúde</li>
                  <li>Direito de solicitar restrições de uso e divulgação</li>
                  <li>Direito de solicitar comunicações confidenciais</li>
                  <li>Direito de solicitar correções</li>
                  <li>Direito de receber um relatório de divulgações</li>
                  <li>Direito de apresentar uma reclamação</li>
                </ul>
                
                <h3 className="text-xl font-semibold mt-6 mb-3">5. Uso e Divulgação</h3>
                <p className="mb-4">
                  Usamos e divulgamos suas informações apenas com seu consentimento explícito, exceto quando exigido por lei. 
                  Não compartilhamos suas informações com parceiros de marketing ou para fins comerciais não relacionados ao seu tratamento.
                </p>
                
                <h3 className="text-xl font-semibold mt-6 mb-3">6. Retenção de Dados</h3>
                <p className="mb-4">
                  Mantemos suas informações de saúde apenas pelo tempo necessário para fornecer nossos serviços e conforme exigido por lei. 
                  Após este período, seus dados são permanentemente excluídos de nossos sistemas.
                </p>
                
                <h3 className="text-xl font-semibold mt-6 mb-3">7. Treinamento e Conscientização</h3>
                <p className="mb-4">
                  Todos os membros da nossa equipe recebem treinamento regular sobre práticas de privacidade HIPAA e procedimentos de segurança 
                  para garantir que suas informações sejam tratadas com o máximo cuidado e confidencialidade.
                </p>
                
                <h3 className="text-xl font-semibold mt-6 mb-3">8. Violações de Segurança</h3>
                <p className="mb-4">
                  Na improvável ocorrência de uma violação de segurança, temos procedimentos abrangentes para documentar, investigar e 
                  notificar os indivíduos afetados, conforme exigido pelas regulamentações da HIPAA.
                </p>
                
                <h3 className="text-xl font-semibold mt-6 mb-3">9. Alterações nesta Política</h3>
                <p className="mb-4">
                  Reservamos o direito de modificar esta política de privacidade HIPAA a qualquer momento. 
                  Quaisquer alterações entrarão em vigor imediatamente após a publicação da política atualizada em nossa plataforma.
                </p>
                
                <h3 className="text-xl font-semibold mt-6 mb-3">10. Contato</h3>
                <p className="mb-4">
                  Para exercer seus direitos sob a HIPAA ou tirar dúvidas sobre nossas práticas de privacidade, entre em contato com 
                  nosso Oficial de Privacidade em: rafael@rshub.com.br
                </p>
                
                <hr className="my-12 border-t border-gray-200" />
                
                <h2 id="roadmap" className="text-2xl font-semibold mt-8 mb-6">{t("hipaaRoadmap")}</h2>
                
                <section className="mb-12">
                  <h3 className="text-xl font-semibold mb-6">{t("currentStatus")}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                      <h4 className="font-medium text-lg mb-4">{t("technicalMeasures")}</h4>
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <Badge variant="default" className="mt-0.5 bg-green-500 text-xs">{t("implemented")}</Badge>
                          <span className="ml-2">{t("dataEncryption")}</span>
                        </li>
                        <li className="flex items-start">
                          <Badge variant="default" className="mt-0.5 bg-green-500 text-xs">{t("implemented")}</Badge>
                          <span className="ml-2">{t("accessControl")}</span>
                        </li>
                        <li className="flex items-start">
                          <Badge variant="default" className="mt-0.5 bg-yellow-500 text-xs">{t("inProgress")}</Badge>
                          <span className="ml-2">{t("auditLogging")}</span>
                        </li>
                        <li className="flex items-start">
                          <Badge variant="default" className="mt-0.5 bg-yellow-500 text-xs">{t("inProgress")}</Badge>
                          <span className="ml-2">{t("backupRecovery")}</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                      <h4 className="font-medium text-lg mb-4">{t("administrativeMeasures")}</h4>
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <Badge variant="default" className="mt-0.5 bg-yellow-500 text-xs">{t("inProgress")}</Badge>
                          <span className="ml-2">{t("securityRiskAssessment")}</span>
                        </li>
                        <li className="flex items-start">
                          <Badge variant="default" className="mt-0.5 bg-gray-500 text-xs">{t("planned")}</Badge>
                          <span className="ml-2">{t("trainingProgram")}</span>
                        </li>
                        <li className="flex items-start">
                          <Badge variant="default" className="mt-0.5 bg-yellow-500 text-xs">{t("inProgress")}</Badge>
                          <span className="ml-2">{t("policiesProcedures")}</span>
                        </li>
                        <li className="flex items-start">
                          <Badge variant="default" className="mt-0.5 bg-gray-500 text-xs">{t("planned")}</Badge>
                          <span className="ml-2">{t("businessAssociates")}</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                      <h4 className="font-medium text-lg mb-4">{t("physicalMeasures")}</h4>
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <Badge variant="default" className="mt-0.5 bg-green-500 text-xs">{t("implemented")}</Badge>
                          <span className="ml-2">{t("facilityAccess")}</span>
                        </li>
                        <li className="flex items-start">
                          <Badge variant="default" className="mt-0.5 bg-yellow-500 text-xs">{t("inProgress")}</Badge>
                          <span className="ml-2">{t("dataDisposal")}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>
                
                <section>
                  <h3 className="text-xl font-semibold mb-6">{t("implementationPlan")}</h3>
                  
                  <Timeline>
                    <TimelineItem>
                      <TimelineSeparator>
                        <TimelineDot className="bg-therapy-purple">1</TimelineDot>
                        <TimelineConnector />
                      </TimelineSeparator>
                      <TimelineContent>
                        <h4 className="font-medium text-lg">{t("phase1")}</h4>
                        <p className="text-gray-600 mt-1">{t("phase1Tasks")}</p>
                      </TimelineContent>
                    </TimelineItem>
                    
                    <TimelineItem>
                      <TimelineSeparator>
                        <TimelineDot className="bg-therapy-purple">2</TimelineDot>
                        <TimelineConnector />
                      </TimelineSeparator>
                      <TimelineContent>
                        <h4 className="font-medium text-lg">{t("phase2")}</h4>
                        <p className="text-gray-600 mt-1">{t("phase2Tasks")}</p>
                      </TimelineContent>
                    </TimelineItem>
                    
                    <TimelineItem>
                      <TimelineSeparator>
                        <TimelineDot className="bg-therapy-purple">3</TimelineDot>
                      </TimelineSeparator>
                      <TimelineContent>
                        <h4 className="font-medium text-lg">{t("phase3")}</h4>
                        <p className="text-gray-600 mt-1">{t("phase3Tasks")}</p>
                      </TimelineContent>
                    </TimelineItem>
                  </Timeline>
                  
                  <div className="mt-12 text-center p-6 bg-gray-50 rounded-lg">
                    <p className="text-gray-700">{t("contactUs")}
                      <a href="mailto:rafael@rshub.com.br" className="text-therapy-purple hover:underline">{t("contactLink")}</a>
                    </p>
                  </div>
                </section>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-semibold mt-8 mb-4">HIPAA Privacy Practices – MindBloom</h2>
                <p className="mb-4">
                  Last updated: April 16, 2025
                </p>
                
                <h3 className="text-xl font-semibold mt-6 mb-3">1. Our HIPAA Compliance</h3>
                <p className="mb-4">
                  MindBloom is committed to complying with the requirements of the U.S. Health Insurance Portability and Accountability Act (HIPAA). 
                  As an entity that handles protected health information (PHI), we have implemented stringent measures to ensure the 
                  confidentiality, integrity, and availability of your mental health information.
                </p>
                
                <h3 className="text-xl font-semibold mt-6 mb-3">2. Protected Health Information (PHI)</h3>
                <p className="mb-4">
                  We consider all information related to your mental health shared on our platform as PHI, including:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Conversation history with our AI</li>
                  <li>Notes and records from sessions with therapists</li>
                  <li>Information about your emotional and mental state</li>
                  <li>Any diagnoses or treatments discussed</li>
                </ul>
                
                <h3 className="text-xl font-semibold mt-6 mb-3">3. Technical Security Measures</h3>
                <p className="mb-4">
                  We have implemented the following measures to protect your information:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Data encryption in transit (TLS/SSL) and at rest (AES-256)</li>
                  <li>Multi-factor authentication for account access</li>
                  <li>Detailed audit logs for all PHI-related activities</li>
                  <li>Role-based access controls to limit access to sensitive data</li>
                  <li>Encrypted backups and disaster recovery procedures</li>
                </ul>
                
                <h3 className="text-xl font-semibold mt-6 mb-3">4. Patient Rights under HIPAA</h3>
                <p className="mb-4">
                  As our user, you have the following rights regarding your information:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Right to access your health information</li>
                  <li>Right to request restrictions on use and disclosure</li>
                  <li>Right to request confidential communications</li>
                  <li>Right to request amendments</li>
                  <li>Right to receive an accounting of disclosures</li>
                  <li>Right to file a complaint</li>
                </ul>
                
                <h3 className="text-xl font-semibold mt-6 mb-3">5. Use and Disclosure</h3>
                <p className="mb-4">
                  We use and disclose your information only with your explicit consent, except when required by law. 
                  We do not share your information with marketing partners or for commercial purposes unrelated to your treatment.
                </p>
                
                <h3 className="text-xl font-semibold mt-6 mb-3">6. Data Retention</h3>
                <p className="mb-4">
                  We retain your health information only for as long as necessary to provide our services and as required by law. 
                  After this period, your data is permanently deleted from our systems.
                </p>
                
                <h3 className="text-xl font-semibold mt-6 mb-3">7. Training and Awareness</h3>
                <p className="mb-4">
                  All members of our team receive regular training on HIPAA privacy practices and security procedures 
                  to ensure your information is treated with the utmost care and confidentiality.
                </p>
                
                <h3 className="text-xl font-semibold mt-6 mb-3">8. Security Breaches</h3>
                <p className="mb-4">
                  In the unlikely event of a security breach, we have comprehensive procedures to document, investigate, and 
                  notify affected individuals as required by HIPAA regulations.
                </p>
                
                <h3 className="text-xl font-semibold mt-6 mb-3">9. Changes to this Policy</h3>
                <p className="mb-4">
                  We reserve the right to modify this HIPAA privacy policy at any time. 
                  Any changes will be effective immediately upon posting of the updated policy on our platform.
                </p>
                
                <h3 className="text-xl font-semibold mt-6 mb-3">10. Contact</h3>
                <p className="mb-4">
                  To exercise your rights under HIPAA or inquire about our privacy practices, please contact 
                  our Privacy Officer at: rafael@rshub.com.br
                </p>
                
                <hr className="my-12 border-t border-gray-200" />
                
                <h2 id="roadmap" className="text-2xl font-semibold mt-8 mb-6">{t("hipaaRoadmap")}</h2>
                
                <section className="mb-12">
                  <h3 className="text-xl font-semibold mb-6">{t("currentStatus")}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                      <h4 className="font-medium text-lg mb-4">{t("technicalMeasures")}</h4>
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <Badge variant="default" className="mt-0.5 bg-green-500 text-xs">{t("implemented")}</Badge>
                          <span className="ml-2">{t("dataEncryption")}</span>
                        </li>
                        <li className="flex items-start">
                          <Badge variant="default" className="mt-0.5 bg-green-500 text-xs">{t("implemented")}</Badge>
                          <span className="ml-2">{t("accessControl")}</span>
                        </li>
                        <li className="flex items-start">
                          <Badge variant="default" className="mt-0.5 bg-yellow-500 text-xs">{t("inProgress")}</Badge>
                          <span className="ml-2">{t("auditLogging")}</span>
                        </li>
                        <li className="flex items-start">
                          <Badge variant="default" className="mt-0.5 bg-yellow-500 text-xs">{t("inProgress")}</Badge>
                          <span className="ml-2">{t("backupRecovery")}</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                      <h4 className="font-medium text-lg mb-4">{t("administrativeMeasures")}</h4>
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <Badge variant="default" className="mt-0.5 bg-yellow-500 text-xs">{t("inProgress")}</Badge>
                          <span className="ml-2">{t("securityRiskAssessment")}</span>
                        </li>
                        <li className="flex items-start">
                          <Badge variant="default" className="mt-0.5 bg-gray-500 text-xs">{t("planned")}</Badge>
                          <span className="ml-2">{t("trainingProgram")}</span>
                        </li>
                        <li className="flex items-start">
                          <Badge variant="default" className="mt-0.5 bg-yellow-500 text-xs">{t("inProgress")}</Badge>
                          <span className="ml-2">{t("policiesProcedures")}</span>
                        </li>
                        <li className="flex items-start">
                          <Badge variant="default" className="mt-0.5 bg-gray-500 text-xs">{t("planned")}</Badge>
                          <span className="ml-2">{t("businessAssociates")}</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                      <h4 className="font-medium text-lg mb-4">{t("physicalMeasures")}</h4>
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <Badge variant="default" className="mt-0.5 bg-green-500 text-xs">{t("implemented")}</Badge>
                          <span className="ml-2">{t("facilityAccess")}</span>
                        </li>
                        <li className="flex items-start">
                          <Badge variant="default" className="mt-0.5 bg-yellow-500 text-xs">{t("inProgress")}</Badge>
                          <span className="ml-2">{t("dataDisposal")}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>
                
                <section>
                  <h3 className="text-xl font-semibold mb-6">{t("implementationPlan")}</h3>
                  
                  <Timeline>
                    <TimelineItem>
                      <TimelineSeparator>
                        <TimelineDot className="bg-therapy-purple">1</TimelineDot>
                        <TimelineConnector />
                      </TimelineSeparator>
                      <TimelineContent>
                        <h4 className="font-medium text-lg">{t("phase1")}</h4>
                        <p className="text-gray-600 mt-1">{t("phase1Tasks")}</p>
                      </TimelineContent>
                    </TimelineItem>
                    
                    <TimelineItem>
                      <TimelineSeparator>
                        <TimelineDot className="bg-therapy-purple">2</TimelineDot>
                        <TimelineConnector />
                      </TimelineSeparator>
                      <TimelineContent>
                        <h4 className="font-medium text-lg">{t("phase2")}</h4>
                        <p className="text-gray-600 mt-1">{t("phase2Tasks")}</p>
                      </TimelineContent>
                    </TimelineItem>
                    
                    <TimelineItem>
                      <TimelineSeparator>
                        <TimelineDot className="bg-therapy-purple">3</TimelineDot>
                      </TimelineSeparator>
                      <TimelineContent>
                        <h4 className="font-medium text-lg">{t("phase3")}</h4>
                        <p className="text-gray-600 mt-1">{t("phase3Tasks")}</p>
                      </TimelineContent>
                    </TimelineItem>
                  </Timeline>
                  
                  <div className="mt-12 text-center p-6 bg-gray-50 rounded-lg">
                    <p className="text-gray-700">{t("contactUs")}
                      <a href="mailto:rafael@rshub.com.br" className="text-therapy-purple hover:underline">{t("contactLink")}</a>
                    </p>
                  </div>
                </section>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HipaaPrivacy;
