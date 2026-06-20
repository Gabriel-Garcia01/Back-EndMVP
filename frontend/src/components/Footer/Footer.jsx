import React from 'react'
import styles  from './Footer.module.css'

const Footer = () => {
  return (
    <div className={styles.footer}>
      <p className={styles.copyright}>&copy; 2026 Terê Verde. Todos os direitos reservados.</p>
      <p className={styles.developers}>Desenvolvido por: Renato Zanco, Gabriel Garcia, Júlio Cézar e Gabriel Nascimento</p>
    </div>
  )
}

export default Footer